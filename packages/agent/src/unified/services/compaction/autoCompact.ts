/**
 * Layer 4: Auto Compact
 *
 * Full conversation summary via LLM when approaching the context window limit.
 * Two sub-paths:
 *   4a. Session memory compaction (using continuously-extracted memory)
 *   4b. Legacy full summary (sends conversation to LLM for detailed summary)
 *
 * Key properties:
 * - Triggers at effectiveContextWindow - bufferTokens (default 13K)
 * - Circuit breaker: stops after N consecutive failures
 * - Produces a CompactBoundaryMessage for boundary tracking
 * - Post-compact cleanup resets all tracking state
 * - When context collapse is active, auto-compact is suppressed
 */

import type { MessageObject } from '@codebolt/types/sdk';
import {
  TokenEstimator,
  type CompactionContext,
  type CompactionLayer,
  type CompactionLayerKind,
  type CompactionBoundary,
} from './types';

/** Tokens below context window to trigger proactive auto-compact */
const DEFAULT_AUTOCOMPACT_BUFFER = 13_000;

/** Max consecutive failures before circuit breaker trips */
const DEFAULT_MAX_CONSECUTIVE_FAILURES = 3;

/** Default model token limit */
const DEFAULT_MODEL_TOKEN_LIMIT = 128_000;

export interface AutoCompactOptions {
  /** Buffer tokens below context window (default: 13000) */
  bufferTokens?: number;
  /** Max consecutive failures before circuit breaker (default: 3) */
  maxConsecutiveFailures?: number;
  /** Model token limit (default: 128000) */
  modelTokenLimit?: number;
  /** Fraction of recent history to preserve after compression (default: 0.3) */
  preserveThreshold?: number;
  /** LLM role for summarization calls (default: 'summarizer') */
  llmRole?: string;
  /** Enable logging (default: false) */
  enableLogging?: boolean;
}

export interface AutoCompactTracking {
  compacted: boolean;
  turnId: string;
  turnCounter: number;
  consecutiveFailures: number;
}

export class AutoCompact implements CompactionLayer {
  readonly name: CompactionLayerKind = 'auto';

  private readonly options: {
    bufferTokens: number;
    maxConsecutiveFailures: number;
    modelTokenLimit: number;
    preserveThreshold: number;
    llmRole: string;
    enableLogging: boolean;
  };

  private consecutiveFailures = 0;
  private tracking: AutoCompactTracking | undefined;
  constructor(options?: AutoCompactOptions) {
    this.options = {
      bufferTokens: options?.bufferTokens ?? DEFAULT_AUTOCOMPACT_BUFFER,
      maxConsecutiveFailures:
        options?.maxConsecutiveFailures ?? DEFAULT_MAX_CONSECUTIVE_FAILURES,
      modelTokenLimit: options?.modelTokenLimit ?? DEFAULT_MODEL_TOKEN_LIMIT,
      preserveThreshold: options?.preserveThreshold ?? 0.3,
      llmRole: options?.llmRole ?? 'summarizer',
      enableLogging: options?.enableLogging ?? false,
    };
  }

  shouldApply(ctx: CompactionContext): boolean {
    // Don't auto-compact if context collapse is handling it
    if (ctx.contextCollapseEnabled) {
      return false;
    }

    // Circuit breaker
    if (this.consecutiveFailures >= this.options.maxConsecutiveFailures) {
      return false;
    }

    // Check threshold
    const estimator = new TokenEstimator();
    const tokenCount =
      estimator.estimateForMessages(ctx.messages) - (ctx.snipTokensFreed || 0);
    const threshold =
      this.options.modelTokenLimit - this.options.bufferTokens;

    return tokenCount >= threshold;
  }

  async apply(ctx: CompactionContext): Promise<CompactionContext> {
    const messages = ctx.messages;
    const estimator = new TokenEstimator();
    const originalTokens =
      estimator.estimateForMessages(messages) - (ctx.snipTokensFreed || 0);

    try {
      const result = await this.compactConversation(messages, ctx);

      if (!result) {
        this.consecutiveFailures++;
        return ctx;
      }

      // Success — reset failure counter
      this.consecutiveFailures = 0;

      const newTokens = estimator.estimateForMessages(result);

      const boundary: CompactionBoundary = {
        layer: 'auto',
        tokensFreed: originalTokens - newTokens,
        messagesRemoved: messages.length - result.length,
        timestamp: new Date().toISOString(),
        summaryIncluded: true,
      };

      this.tracking = {
        compacted: true,
        turnId: `auto-${Date.now()}`,
        turnCounter: 0,
        consecutiveFailures: 0,
      };

      if (this.options.enableLogging) {
        console.log(
          `[AutoCompact] Compacted: ${originalTokens} -> ${newTokens} tokens (${boundary.tokensFreed} freed, ${boundary.messagesRemoved} messages removed)`,
        );
      }

      return {
        ...ctx,
        messages: result,
        compactionHistory: [...(ctx.compactionHistory || []), boundary],
        autoCompactTracking: this.tracking,
      };
    } catch (error) {
      this.consecutiveFailures++;
      if (this.options.enableLogging) {
        console.error('[AutoCompact] Compaction failed:', error);
      }
      return ctx;
    }
  }

  reset(): void {
    this.consecutiveFailures = 0;
    this.tracking = undefined;
  }

  getTracking(): AutoCompactTracking | undefined {
    return this.tracking;
  }

  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  // ─── Core Compaction Logic ────────────────────────────────────────

  private async compactConversation(
    messages: MessageObject[],
    ctx: CompactionContext,
  ): Promise<MessageObject[] | null> {
    const estimator = new TokenEstimator();

    // Find split point: preserve the most recent portion of conversation
    const splitIndex = this.findSplitIndex(messages);

    if (splitIndex === 0) {
      return null; // Nothing to compact
    }

    // Separate into history-to-compact and history-to-keep
    const systemMessages = messages.filter(m => m.role === 'system');
    const historyToCompress = messages
      .slice(0, splitIndex)
      .filter(m => m.role !== 'system');
    const preservedMessages = messages.slice(splitIndex);

    if (historyToCompress.length === 0) {
      return null;
    }

    // Generate summary
    const summary = await this.generateSummary(historyToCompress);

    if (!summary || summary.trim().length === 0) {
      return null;
    }

    // Build post-compact message array
    const postCompactMessages: MessageObject[] = [
      ...systemMessages,
      {
        role: 'user' as const,
        content: `This session is being continued from a previous conversation that ran out of context. Below is a summary of the conversation so far.\n\n${summary}\n\nPlease continue from where the previous conversation left off. Do not ask the user to re-explain what they already told you — the summary above contains all the context you need.`,
      },
      {
        role: 'assistant' as const,
        content: 'Understood. I have the summary of the previous conversation and will continue from where we left off.',
      },
      ...preservedMessages,
    ];

    // Verify compression was effective
    const newTokens = estimator.estimateForMessages(postCompactMessages);
    const originalTokens =
      estimator.estimateForMessages(messages) - (ctx.snipTokensFreed || 0);

    if (newTokens >= originalTokens) {
      if (this.options.enableLogging) {
        console.warn(
          `[AutoCompact] Summary inflated token count: ${originalTokens} -> ${newTokens}`,
        );
      }
      return null;
    }

    return postCompactMessages;
  }

  private findSplitIndex(messages: MessageObject[]): number {
    // Find turn boundaries (user messages that aren't tool responses)
    const turnStarts: number[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg) continue;
      if (
        msg.role === 'user' &&
        !msg.tool_call_id &&
        !this.isToolResponse(msg)
      ) {
        turnStarts.push(i);
      }
    }

    if (turnStarts.length <= 3) {
      return 0; // Too few turns to compress
    }

    // Keep the last preserveThreshold fraction of turns
    const turnsToKeep = Math.max(
      3,
      Math.ceil(turnStarts.length * this.options.preserveThreshold),
    );
    const turnsToRemove = turnStarts.length - turnsToKeep;

    if (turnsToRemove <= 0) {
      return 0;
    }

    // Adjust to avoid splitting in the middle of a tool-response chain
    let splitIndex = turnStarts[turnsToRemove] ?? messages.length;

    // Walk forward to skip tool responses that belong to the previous turn
    while (splitIndex < messages.length) {
      const msg = messages[splitIndex];
      if (!msg) break;
      if (msg.role === 'tool' || msg.tool_call_id) {
        splitIndex++;
        continue;
      }
      break;
    }

    return splitIndex;
  }

  private async generateSummary(messages: MessageObject[]): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const codebolt = require('@codebolt/codeboltjs');

      // Build compression prompt
      const historyText = messages
        .map((msg, i) => {
          const content =
            typeof msg.content === 'string'
              ? msg.content
              : JSON.stringify(msg.content ?? '');
          // Truncate very long messages for the prompt
          const truncated =
            content.length > 2000
              ? content.slice(0, 1000) +
                `\n...[${content.length - 2000} chars truncated]...\n` +
                content.slice(-1000)
              : content;
          return `[${i + 1}] ${msg.role}: ${truncated}`;
        })
        .join('\n\n');

      const prompt = `You are a conversation compression assistant. Create a detailed, structured summary that preserves ALL critical context so work can continue seamlessly.

CONVERSATION HISTORY TO COMPRESS:
${historyText}

Generate the summary with ALL of the following sections:

<summary>
1. PRIMARY REQUEST
[The user's original, complete request]

2. TASK EVOLUTION
[How the task evolved. Include key user instructions that changed direction]

3. KEY TECHNICAL CONCEPTS
[Architecture decisions, design patterns, algorithms, data structures, API contracts]

4. FILES AND CODE
[Every file that was read, created, or modified. Include file paths and key changes]

5. PROBLEM SOLVING
[Errors encountered and solutions applied]

6. PENDING TASKS
[Tasks mentioned but NOT yet completed]

7. CURRENT WORK STATE
[Exactly where the work left off]

8. NEXT STEP
[The most logical next action]
</summary>

CRITICAL RULES:
- Preserve ALL file paths exactly
- Preserve ALL code snippets, function names, error messages verbatim
- Include the FULL original user request, not a paraphrase
- Do not summarize away technical details
- Focus on facts and specifics`;

      const response = await codebolt.llm.inference({
        messages: [
          {
            role: 'system',
            content:
              'You are a precise conversation compression assistant. Be comprehensive but concise.',
          },
          { role: 'user', content: prompt },
        ],
      });

      // Extract summary from response
      let summary: string | undefined;
      if (typeof response?.completion?.content === 'string') {
        summary = response.completion.content;
      } else if (response?.completion?.choices?.[0]?.message?.content) {
        summary = response.completion.choices[0].message.content;
      }

      if (summary && summary.trim().length > 0) {
        return summary.trim();
      }

      return '';
    } catch (error) {
      console.error('[AutoCompact] Error generating summary:', error);
      return '';
    }
  }

  private isToolResponse(msg: MessageObject): boolean {
    if (msg.role === 'tool') return true;
    if (msg.tool_call_id) return true;
    if (typeof msg.content === 'object' && msg.content !== null) {
      if (Array.isArray(msg.content)) {
        return msg.content.some(
          (block: any) =>
            block &&
            (block.type === 'tool_result' || block.type === 'function_response'),
        );
      }
    }
    return false;
  }
}
