/**
 * Layer 3: Context Collapse
 *
 * Incrementally archives messages into a collapse store with granular summaries.
 * Unlike full auto-compact which produces one monolithic summary, context collapse
 * preserves granular per-range summaries so more context is retained.
 *
 * Key properties:
 * - Commits at ~90% of context window
 * - Blocks at ~95% (hard limit)
 * - Archives messages incrementally (not all at once)
 * - Read-time projection over full history
 * - Recovery: drains staged collapses on 413 errors (cheap)
 * - When enabled, suppresses auto-compact to avoid racing
 */

import type { MessageObject } from '@codebolt/types/sdk';
import {
  TokenEstimator,
  type CompactionContext,
  type CompactionLayer,
  type CompactionLayerKind,
  type CompactionBoundary,
} from './types';

/** Default commit threshold (fraction of context window) */
const DEFAULT_COMMIT_THRESHOLD = 0.9;
/** Default blocking threshold */
const DEFAULT_BLOCKING_THRESHOLD = 0.95;
/** Minimum tokens to archive per collapse commit */
const MIN_COLLAPSE_TOKENS = 2000;

export interface ContextCollapseOptions {
  /** Commit threshold as fraction of context window (default: 0.9) */
  commitThreshold?: number;
  /** Blocking threshold as fraction of context window (default: 0.95) */
  blockingThreshold?: number;
  /** Model token limit (default: 128000) */
  modelTokenLimit?: number;
  /** LLM role for granular summarization (default: 'summarizer') */
  llmRole?: string;
  /** Max summaries to keep in the collapse store (default: 20) */
  maxSummaries?: number;
  /** Enable logging (default: false) */
  enableLogging?: boolean;
}

interface CollapseEntry {
  /** Index range in original messages that was collapsed */
  startIdx: number;
  endIdx: number;
  /** Granular summary of the collapsed range */
  summary: string;
  /** Token count of the original range */
  originalTokens: number;
  /** Timestamp of collapse */
  timestamp: string;
  /** Whether this is staged (pending, not yet confirmed by successful API call) */
  staged: boolean;
}

export class ContextCollapse implements CompactionLayer {
  readonly name: CompactionLayerKind = 'collapse';

  private readonly options: {
    commitThreshold: number;
    blockingThreshold: number;
    modelTokenLimit: number;
    llmRole: string;
    maxSummaries: number;
    enableLogging: boolean;
  };

  /** The collapse store: ordered list of collapsed ranges */
  private store: CollapseEntry[] = [];
  /** Staged collapses waiting for API confirmation */
  private staged: CollapseEntry[] = [];
  constructor(options?: ContextCollapseOptions) {
    this.options = {
      commitThreshold: options?.commitThreshold ?? DEFAULT_COMMIT_THRESHOLD,
      blockingThreshold: options?.blockingThreshold ?? DEFAULT_BLOCKING_THRESHOLD,
      modelTokenLimit: options?.modelTokenLimit ?? 128000,
      llmRole: options?.llmRole ?? 'summarizer',
      maxSummaries: options?.maxSummaries ?? 20,
      enableLogging: options?.enableLogging ?? false,
    };
  }

  shouldApply(ctx: CompactionContext): boolean {
    if (!ctx.contextCollapseEnabled) return false;

    const estimator = new TokenEstimator();
    const tokenCount = estimator.estimateForMessages(ctx.messages);
    const threshold = this.options.commitThreshold * this.options.modelTokenLimit;

    return tokenCount >= threshold;
  }

  async apply(ctx: CompactionContext): Promise<CompactionContext> {
    if (!ctx.contextCollapseEnabled) return ctx;

    const estimator = new TokenEstimator();
    const tokenCount = estimator.estimateForMessages(ctx.messages);
    const commitThreshold = this.options.commitThreshold * this.options.modelTokenLimit;

    if (tokenCount < commitThreshold) {
      return ctx;
    }

    // Determine how many messages to archive
    const messages = ctx.messages;
    const targetTokens = commitThreshold * 0.8; // Target 80% of threshold after collapse
    const currentTokens = tokenCount;
    const tokensToArchive = currentTokens - targetTokens;

    if (tokensToArchive < MIN_COLLAPSE_TOKENS) {
      return ctx;
    }

    // Find the split point: archive from the beginning, after system messages
    const splitIdx = this.findSplitPoint(messages, tokensToArchive, estimator);
    if (splitIdx <= 0) {
      return ctx;
    }

    // Archive the range
    const toArchive = messages.slice(0, splitIdx);
    const preserved = messages.slice(splitIdx);

    // Generate granular summary
    const summary = await this.generateGranularSummary(toArchive);

    const entry: CollapseEntry = {
      startIdx: 0,
      endIdx: splitIdx,
      summary,
      originalTokens: estimator.estimateForMessages(toArchive),
      timestamp: new Date().toISOString(),
      staged: true,
    };

    // Add to staged (will be confirmed after successful API call)
    this.staged.push(entry);

    // Build projected view: summaries + preserved messages
    const systemMessages = toArchive.filter(m => m.role === 'system');
    const projectedMessages: MessageObject[] = [
      ...systemMessages,
      ...this.buildSummaryMessages(),
      ...preserved,
    ];

    const tokensFreed = currentTokens - estimator.estimateForMessages(projectedMessages);

    const boundary: CompactionBoundary = {
      layer: 'collapse',
      tokensFreed: Math.max(0, tokensFreed),
      messagesRemoved: toArchive.length - systemMessages.length,
      timestamp: entry.timestamp,
    };

    if (this.options.enableLogging) {
      console.log(
        `[ContextCollapse] Collapsed ${toArchive.length} messages (~${entry.originalTokens} tokens). Freed ~${tokensFreed} tokens.`,
      );
    }

    return {
      ...ctx,
      messages: projectedMessages,
      compactionHistory: [...(ctx.compactionHistory || []), boundary],
    };
  }

  /**
   * Drain staged collapses on API 413 errors (recovery path).
   * Confirms all staged entries into the permanent store.
   */
  drainStaged(): number {
    if (this.staged.length === 0) return 0;

    const count = this.staged.length;
    for (const entry of this.staged) {
      entry.staged = false;
      this.store.push(entry);
    }

    // Trim store to max size
    if (this.store.length > this.options.maxSummaries) {
      this.store = this.store.slice(-this.options.maxSummaries);
    }

    this.staged = [];
    return count;
  }

  /**
   * Recovery from overflow: drain staged collapses and rebuild.
   */
  recoverFromOverflow(
    messages: MessageObject[],
  ): { messages: MessageObject[]; committed: number } {
    const committed = this.drainStaged();
    if (committed === 0) {
      return { messages, committed: 0 };
    }

    // Rebuild with confirmed summaries
    const systemMessages = messages.filter(m => m.role === 'system');
    const nonSystem = messages.filter(m => m.role !== 'system');

    const rebuilt: MessageObject[] = [
      ...systemMessages,
      ...this.buildSummaryMessages(),
      ...nonSystem,
    ];

    return { messages: rebuilt, committed };
  }

  /**
   * Check if at blocking threshold.
   */
  isAtBlockingLimit(messages: MessageObject[]): boolean {
    const estimator = new TokenEstimator();
    const tokenCount = estimator.estimateForMessages(messages);
    const blockingLimit = this.options.blockingThreshold * this.options.modelTokenLimit;
    return tokenCount >= blockingLimit;
  }

  reset(): void {
    this.store = [];
    this.staged = [];
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private findSplitPoint(
    messages: MessageObject[],
    tokensToArchive: number,
    estimator: TokenEstimator,
  ): number {
    let accumulated = 0;

    // Skip system messages at the beginning
    let startIdx = 0;
    while (startIdx < messages.length && messages[startIdx]?.role === 'system') {
      startIdx++;
    }

    for (let i = startIdx; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg) continue;

      const content =
        typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content ?? '');
      accumulated += estimator.estimate(content) + 4;

      // Don't split in the middle of a tool call/response pair
      if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
        continue;
      }
      if (msg.role === 'tool' || msg.tool_call_id) {
        continue;
      }

      // Safe split point: user message or assistant without pending tools
      if (accumulated >= tokensToArchive) {
        return i + 1;
      }
    }

    return 0; // No safe split point found
  }

  private buildSummaryMessages(): MessageObject[] {
    const allEntries = [...this.store, ...this.staged];
    if (allEntries.length === 0) return [];

    const combinedSummary = allEntries
      .map((entry, i) => `--- Collapsed Section ${i + 1} ---\n${entry.summary}`)
      .join('\n\n');

    return [
      {
        role: 'user' as const,
        content: `[Context Summary - The following sections were collapsed to manage context length. Key information has been preserved.]\n\n${combinedSummary}`,
      },
      {
        role: 'assistant' as const,
        content: 'Understood. I have the collapsed context summary and will continue from the current state.',
      },
    ];
  }

  private async generateGranularSummary(messages: MessageObject[]): Promise<string> {
    const estimator = new TokenEstimator();

    // For small ranges, create a structural summary without LLM
    const tokenCount = estimator.estimateForMessages(messages);

    if (tokenCount < 5000) {
      return this.createStructuralSummary(messages);
    }

    // For larger ranges, try LLM summarization
    try {
      const codebolt = require('@codebolt/codeboltjs');
      const historyText = messages
        .map((msg, i) => {
          const content =
            typeof msg.content === 'string'
              ? msg.content
              : JSON.stringify(msg.content ?? '');
          const truncated =
            content.length > 500
              ? content.slice(0, 250) + '...[truncated]...' + content.slice(-250)
              : content;
          return `[${i}] ${msg.role}: ${truncated}`;
        })
        .join('\n');

      const prompt = `Summarize this conversation segment concisely. Preserve: key decisions, file paths, code changes, errors encountered, current task state. Be factual and specific.

${historyText}`;

      const response = await codebolt.llm.inference({
        messages: [
          { role: 'system', content: 'You are a precise conversation summarizer. Be concise but complete.' },
          { role: 'user', content: prompt },
        ],
      });

      const summary = response?.completion?.content || response?.completion?.choices?.[0]?.message?.content;
      if (summary && typeof summary === 'string' && summary.trim().length > 0) {
        return summary.trim();
      }
    } catch {
      // Fall back to structural summary
    }

    return this.createStructuralSummary(messages);
  }

  private createStructuralSummary(messages: MessageObject[]): string {
    const parts: string[] = [];
    let userMessages = 0;
    let toolCalls = 0;
    const files = new Set<string>();

    for (const msg of messages) {
      if (!msg) continue;
      if (msg.role === 'user' && !msg.tool_call_id) userMessages++;
      if (msg.tool_calls) toolCalls += msg.tool_calls.length;

      // Extract file paths from content
      const content =
        typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content ?? '');
      const filePathMatches = content.match(/['"`](\/?[^\s'"`]+\.[a-zA-Z0-9]+)['"`]/g);
      if (filePathMatches) {
        for (const match of filePathMatches) {
          files.add(match.replace(/['"`]/g, ''));
        }
      }
    }

    parts.push(`Messages: ${messages.length} (${userMessages} user, ${toolCalls} tool calls)`);
    if (files.size > 0) {
      parts.push(`Files referenced: ${Array.from(files).slice(0, 10).join(', ')}`);
    }

    // Include first and last user message content (truncated)
    const firstUser = messages.find(m => m.role === 'user' && !m.tool_call_id);
    if (firstUser) {
      const content =
        typeof firstUser.content === 'string'
          ? firstUser.content
          : JSON.stringify(firstUser.content ?? '');
      parts.push(`First user message: ${content.slice(0, 200)}${content.length > 200 ? '...' : ''}`);
    }

    return parts.join('\n');
  }
}
