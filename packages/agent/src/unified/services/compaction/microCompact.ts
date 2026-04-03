/**
 * Layer 2: Micro Compact
 *
 * Three sub-mechanisms for clearing old tool results:
 *   2a. Time-based: clear old tool results after inactivity gap, keeps N most recent.
 *   2b. Count-based: Clear when registered results exceed threshold.
 *   2c. Budget-based: truncate largest results when total exceeds budget.
 *
 * Key properties:
 * - Cheaper than collapse/auto (no LLM call, just content replacement)
 * - Time-based fires when cache is cold (long gap = server cache expired)
 * - Count-based fires when tool result count exceeds threshold
 * - Both preserve the most recent N tool results
 */

import type { MessageObject } from '@codebolt/types/sdk';
import {
  TokenEstimator,
  type CompactionContext,
  type CompactionLayer,
  type CompactionLayerKind,
  type CompactionBoundary,
} from './types';

const CLEAR_PLACEHOLDER = '[Old tool result content cleared]';

const DEFAULT_GAP_THRESHOLD_MINUTES = 60;
const DEFAULT_KEEP_RECENT = 5;
const DEFAULT_COMPACTABLE_TOOLS = [
  'read_file', 'write_file', 'edit_file', 'list_directory',
  'search_files', 'execute_command', 'shell', 'bash',
  'glob', 'grep', 'web_search', 'web_fetch',
];

export interface MicroCompactOptions {
  gapThresholdMinutes?: number;
  keepRecent?: number;
  compactableTools?: string[];
  tokenBudget?: number;
  enableLogging?: boolean;
}

export class MicroCompact implements CompactionLayer {
  readonly name: CompactionLayerKind = 'micro';

  private readonly options: {
    gapThresholdMinutes: number;
    keepRecent: number;
    compactableTools: Set<string>;
    tokenBudget: number;
    enableLogging: boolean;
  };

  constructor(options?: MicroCompactOptions) {
    this.options = {
      gapThresholdMinutes: options?.gapThresholdMinutes ?? DEFAULT_GAP_THRESHOLD_MINUTES,
      keepRecent: options?.keepRecent ?? DEFAULT_KEEP_RECENT,
      compactableTools: new Set(options?.compactableTools ?? DEFAULT_COMPACTABLE_TOOLS),
      tokenBudget: options?.tokenBudget ?? 50000,
      enableLogging: options?.enableLogging ?? false,
    };
  }

  shouldApply(ctx: CompactionContext): boolean {
    const messages = ctx.messages;
    if (!messages || messages.length === 0) return false;

    // Time-based trigger
    if (this.evaluateTimeTrigger(messages)) return true;

    // Count-based trigger
    if (this.collectCompactableToolIds(messages).length > this.options.keepRecent) return true;

    // Budget-based trigger
    if (this.estimateToolResultTokens(messages) > this.options.tokenBudget) return true;

    return false;
  }

  async apply(ctx: CompactionContext): Promise<CompactionContext> {
    const messages = ctx.messages;
    const timeTrigger = this.evaluateTimeTrigger(messages);

    const allIds = this.collectCompactableToolIds(messages);
    const keepRecent = Math.max(1, this.options.keepRecent);
    const keepSet = new Set(allIds.slice(-keepRecent));

    const subMechanism = timeTrigger ? 'time_based' : 'count_based';
    const { result, tokensSaved } = this.clearOldToolResults(messages, keepSet);

    if (tokensSaved === 0) {
      return ctx;
    }

    const boundary: CompactionBoundary = {
      layer: 'micro',
      tokensFreed: tokensSaved,
      messagesRemoved: 0,
      timestamp: new Date().toISOString(),
    };

    if (this.options.enableLogging) {
      console.log(`[MicroCompact] ${subMechanism}: cleared tool results, ~${tokensSaved} tokens freed`);
    }

    return {
      ...ctx,
      messages: result,
      compactionHistory: [...(ctx.compactionHistory || []), boundary],
    };
  }

  reset(): void {
    // Stateless across turns
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private evaluateTimeTrigger(messages: MessageObject[]): { gapMinutes: number } | null {
    let lastAssistant: MessageObject | undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === 'assistant') {
        lastAssistant = messages[i];
        break;
      }
    }
    if (!lastAssistant) return null;

    const timestamp = (lastAssistant as any).timestamp ?? (lastAssistant as any).created_at;
    if (!timestamp) return null;

    const gapMs = Date.now() - new Date(timestamp).getTime();
    const gapMinutes = gapMs / 60_000;

    if (!Number.isFinite(gapMinutes) || gapMinutes < this.options.gapThresholdMinutes) {
      return null;
    }
    return { gapMinutes };
  }

  private collectCompactableToolIds(messages: MessageObject[]): string[] {
    const ids: string[] = [];
    for (const msg of messages) {
      if (msg?.role === 'assistant' && Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (
            block && typeof block === 'object' &&
            (block as any).type === 'tool_use' &&
            this.options.compactableTools.has((block as any).name)
          ) {
            ids.push((block as any).id);
          }
        }
      }
      if (msg?.role === 'assistant' && Array.isArray((msg as any).tool_calls)) {
        for (const tc of (msg as any).tool_calls) {
          if (tc && this.options.compactableTools.has(tc.function?.name ?? tc.name)) {
            ids.push(tc.id);
          }
        }
      }
    }
    return ids;
  }

  private clearOldToolResults(
    messages: MessageObject[],
    keepSet: Set<string>,
  ): { result: MessageObject[]; tokensSaved: number } {
    const clearSet = new Set(
      this.collectCompactableToolIds(messages).filter(id => !keepSet.has(id)),
    );

    if (clearSet.size === 0) {
      return { result: messages, tokensSaved: 0 };
    }

    let tokensSaved = 0;
    const estimator = new TokenEstimator();

    const result: MessageObject[] = messages.map(msg => {
      if (msg.role === 'tool' || (msg as any).tool_call_id) {
        const toolCallId = (msg as any).tool_call_id;
        if (clearSet.has(toolCallId)) {
          const originalContent = typeof msg.content === 'string'
            ? msg.content : JSON.stringify(msg.content ?? '');
          tokensSaved += estimator.estimate(originalContent);
          return { ...msg, content: CLEAR_PLACEHOLDER };
        }
      }

      if (msg.role === 'user' && Array.isArray(msg.content)) {
        let touched = false;
        const newContent = (msg.content as any[]).map((block: any) => {
          if (
            block &&
            (block.type === 'tool_result' || block.type === 'function_response') &&
            clearSet.has(block.tool_use_id ?? block.tool_call_id)
          ) {
            const originalContent = typeof block.content === 'string'
              ? block.content : JSON.stringify(block.content ?? '');
            tokensSaved += estimator.estimate(originalContent);
            touched = true;
            return { ...block, content: CLEAR_PLACEHOLDER };
          }
          return block;
        });

        if (!touched) return msg;
        return { ...msg, content: newContent };
      }

      return msg;
    });

    return { result, tokensSaved };
  }

  private estimateToolResultTokens(messages: MessageObject[]): number {
    const estimator = new TokenEstimator();
    let total = 0;

    for (const msg of messages) {
      if (msg.role === 'tool' || (msg as any).tool_call_id) {
        const toolName = (msg as any).name ?? '';
        if (this.options.compactableTools.has(toolName)) {
          const content = typeof msg.content === 'string'
            ? msg.content : JSON.stringify(msg.content ?? '');
          total += estimator.estimate(content);
        }
      }

      if (msg.role === 'user' && Array.isArray(msg.content)) {
        for (const block of msg.content as any[]) {
          if (block && (block.type === 'tool_result' || block.type === 'function_response')) {
            const content = typeof block.content === 'string'
              ? block.content : JSON.stringify(block.content ?? '');
            total += estimator.estimate(content);
          }
        }
      }
    }

    return total;
  }
}
