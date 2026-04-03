/**
 * Layer 1: Snip Compact
 *
 * Proactively removes older messages from the model-facing view each turn.
 * Keeps them in the conversation for scrollback/UI purposes, but removes
 * them from what gets sent to the LLM.
 *
 * Key properties:
 * - Runs every turn, proactively
 * - tokensFreed is plumbed to autocompact so its threshold check is accurate
 * - Cheapest compaction layer (no LLM call, just array slicing)
 */

import type { MessageObject } from '@codebolt/types/sdk';
import {
  TokenEstimator,
  type CompactionContext,
  type CompactionLayer,
  type CompactionLayerKind,
  type CompactionBoundary,
} from './types';

/** Number of recent turns (user messages) to always protect from snipping */
const DEFAULT_PROTECTED_TURNS = 4;

/** Maximum fraction of messages that snip is allowed to remove in one pass */
const DEFAULT_MAX_SNIP_FRACTION = 0.4;

export interface SnipCompactOptions {
  /** Number of recent turns to protect (default: 4) */
  protectedTurns?: number;
  /** Max fraction of messages to remove (default: 0.4) */
  maxSnipFraction?: number;
  /** Enable logging (default: false) */
  enableLogging?: boolean;
}

export class SnipCompact implements CompactionLayer {
  readonly name: CompactionLayerKind = 'snip';

  private readonly options: {
    protectedTurns: number;
    maxSnipFraction: number;
    enableLogging: boolean;
  };

  constructor(options?: SnipCompactOptions) {
    this.options = {
      protectedTurns: options?.protectedTurns ?? DEFAULT_PROTECTED_TURNS,
      maxSnipFraction: options?.maxSnipFraction ?? DEFAULT_MAX_SNIP_FRACTION,
      enableLogging: options?.enableLogging ?? false,
    };
  }

  shouldApply(ctx: CompactionContext): boolean {
    // Snip runs proactively every turn, as long as there are enough messages.
    // Skip if there's been a recent compaction boundary we must respect.
    const messages = ctx.messages;
    if (!messages || messages.length <= this.options.protectedTurns * 3) {
      return false;
    }
    return true;
  }

  async apply(ctx: CompactionContext): Promise<CompactionContext> {
    const messages = ctx.messages;
    const estimator = new TokenEstimator();

    // Find turn boundaries (each turn starts with a user message that is not a tool response)
    const turnStarts = this.findTurnStarts(messages);

    if (turnStarts.length <= this.options.protectedTurns) {
      return ctx;
    }

    // Determine how many turns to snip
    const maxSnippable = turnStarts.length - this.options.protectedTurns;
    const snipCount = Math.min(
      maxSnippable,
      Math.ceil(turnStarts.length * this.options.maxSnipFraction),
    );

    if (snipCount <= 0) {
      return ctx;
    }

    // The first protected turn index
    const firstProtectedTurn = turnStarts[snipCount] ?? messages.length;

    // Count tokens in the snipped range
    const snippedMessages = messages.slice(0, firstProtectedTurn);
    const tokensFreed = estimator.estimateForMessages(snippedMessages);

    // Preserve system messages from the snipped range
    const systemMessages = snippedMessages.filter(
      m => m.role === 'system',
    );

    // Keep: system messages + protected range
    const protectedMessages = messages.slice(firstProtectedTurn);
    const resultMessages: MessageObject[] = [
      ...systemMessages,
      // Add a lightweight placeholder noting what was snipped
      {
        role: 'user' as const,
        content: `[Context: ${snipCount} earlier conversation turn(s) trimmed to manage context length. The original task and all recent work are preserved below.]`,
      },
      {
        role: 'assistant' as const,
        content: 'Understood. I have the trimmed context and will continue from the current state.',
      },
      ...protectedMessages,
    ];

    const boundary: CompactionBoundary = {
      layer: 'snip',
      tokensFreed,
      messagesRemoved: snippedMessages.length - systemMessages.length,
      timestamp: new Date().toISOString(),
    };

    if (this.options.enableLogging) {
      console.log(
        `[SnipCompact] Snipped ${snipCount} turns (${snippedMessages.length} messages, ~${tokensFreed} tokens freed)`,
      );
    }

    return {
      ...ctx,
      messages: resultMessages,
      snipTokensFreed: tokensFreed,
      compactionHistory: [...(ctx.compactionHistory || []), boundary],
    };
  }

  reset(): void {
    // SnipCompact is stateless across turns
  }

  private findTurnStarts(messages: MessageObject[]): number[] {
    const turns: number[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg) continue;
      // A turn starts at a user message that isn't a tool response
      if (
        msg.role === 'user' &&
        !this.isToolResponse(msg)
      ) {
        turns.push(i);
      }
    }
    return turns;
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
