/**
 * Layer 5: Reactive Compact
 *
 * Emergency compaction triggered by API errors (413 prompt-too-long,
 * media-size errors). This is the last line of defense when all proactive
 * layers fail to keep the context under the limit.
 *
 * Key properties:
 * - Only fires on real API errors after proactive measures fail
 * - Single-shot per turn (prevents spiral: error -> compact -> error -> compact)
 * - Tries: strip images -> strip older messages -> full compact
 * - Withholds error from consumers until recovery succeeds or exhausts
 */

import type { MessageObject } from '@codebolt/types/sdk';
import {
  TokenEstimator,
  type CompactionContext,
  type CompactionLayer,
  type CompactionLayerKind,
} from './types';

/** Error patterns that indicate context overflow */
const CONTEXT_ERROR_PATTERNS = [
  /prompt too long/i,
  /context length/i,
  /maximum context/i,
  /context window/i,
  /too many tokens/i,
  /token limit/i,
  /request too large/i,
  /input is too long/i,
  /reduced_image_max_pixels/i,
  /image.*too large/i,
];

/** Messages to always preserve during reactive compact */
const MIN_PRESERVED_MESSAGES = 6;

export interface ReactiveCompactOptions {
  /** Max retry attempts per turn (default: 1) */
  retryLimit?: number;
  /** Model token limit (default: 128000) */
  modelTokenLimit?: number;
  /** Enable logging (default: false) */
  enableLogging?: boolean;
}

export interface ReactiveRecoveryResult {
  recovered: boolean;
  messages: MessageObject[];
  reason: string;
  tokensBefore: number;
  tokensAfter: number;
}

export class ReactiveCompact implements CompactionLayer {
  readonly name: CompactionLayerKind = 'reactive';

  private readonly options: {
    retryLimit: number;
    modelTokenLimit: number;
    enableLogging: boolean;
  };

  private hasAttemptedThisTurn = false;
  private retryCount = 0;

  constructor(options?: ReactiveCompactOptions) {
    this.options = {
      retryLimit: options?.retryLimit ?? 1,
      modelTokenLimit: options?.modelTokenLimit ?? 128000,
      enableLogging: options?.enableLogging ?? false,
    };
  }

  shouldApply(_ctx: CompactionContext): boolean {
    // Reactive only fires when explicitly triggered by an error
    // via tryRecoverFromError(), not proactively
    return false;
  }

  async apply(_ctx: CompactionContext): Promise<CompactionContext> {
    // Reactive compact is not applied proactively
    return _ctx;
  }

  reset(): void {
    this.hasAttemptedThisTurn = false;
    this.retryCount = 0;
  }

  /**
   * Reset per-turn guard (call at the start of each turn).
   */
  resetForTurn(): void {
    this.hasAttemptedThisTurn = false;
  }

  /**
   * Check if an error message indicates a recoverable context error.
   */
  isRecoverableError(errorMessage: string): boolean {
    return CONTEXT_ERROR_PATTERNS.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Check if an error is a media/size error (images, PDFs, etc.)
   */
  isMediaSizeError(error: unknown): boolean {
    if (!error) return false;
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : String(error);
    return (
      /image.*too large/i.test(msg) ||
      /reduced_image_max_pixels/i.test(msg) ||
      /media.*size/i.test(msg) ||
      /too many images/i.test(msg)
    );
  }

  /**
   * Attempt to recover from a context overflow error.
   * Single-shot per turn to prevent death spirals.
   *
   * Recovery strategy:
   *   1. Strip images and retry (for media errors)
   *   2. Strip oldest messages (keep recent context)
   *   3. Force full compact if available
   */
  async tryRecoverFromError(
    ctx: CompactionContext,
    error: unknown,
  ): Promise<ReactiveRecoveryResult> {
    const estimator = new TokenEstimator();
    const messages = [...ctx.messages];
    const tokensBefore = estimator.estimateForMessages(messages);

    // Single-shot guard
    if (this.hasAttemptedThisTurn) {
      return {
        recovered: false,
        messages,
        reason: 'Already attempted reactive compact this turn',
        tokensBefore,
        tokensAfter: tokensBefore,
      };
    }

    // Check retry limit
    if (this.retryCount >= this.options.retryLimit) {
      return {
        recovered: false,
        messages,
        reason: `Reactive compact retry limit reached (${this.options.retryLimit})`,
        tokensBefore,
        tokensAfter: tokensBefore,
      };
    }

    this.hasAttemptedThisTurn = true;
    this.retryCount++;

    // Strategy 1: Strip images (for media-size errors)
    if (this.isMediaSizeError(error)) {
      const stripped = this.stripImages(messages);
      const tokensAfter = estimator.estimateForMessages(stripped);

      if (tokensAfter < tokensBefore) {
        if (this.options.enableLogging) {
          console.log(
            `[ReactiveCompact] Stripped images: ${tokensBefore} -> ${tokensAfter} tokens`,
          );
        }
        return {
          recovered: true,
          messages: stripped,
          reason: 'Stripped oversized images',
          tokensBefore,
          tokensAfter,
        };
      }
    }

    // Strategy 2: Strip oldest messages (aggressive)
    const aggressiveResult = this.stripOldestMessages(messages);
    if (aggressiveResult) {
      const tokensAfter = estimator.estimateForMessages(aggressiveResult);
      const threshold = this.options.modelTokenLimit * 0.7;

      if (tokensAfter < threshold) {
        if (this.options.enableLogging) {
          console.log(
            `[ReactiveCompact] Stripped old messages: ${tokensBefore} -> ${tokensAfter} tokens`,
          );
        }
        return {
          recovered: true,
          messages: aggressiveResult,
          reason: 'Stripped oldest messages',
          tokensBefore,
          tokensAfter,
        };
      }
    }

    // Strategy 3: Force compact - summarize everything aggressively
    const forceResult = await this.forceCompact(messages);
    if (forceResult) {
      const tokensAfter = estimator.estimateForMessages(forceResult);
      if (tokensAfter < tokensBefore * 0.8) {
        if (this.options.enableLogging) {
          console.log(
            `[ReactiveCompact] Force compact: ${tokensBefore} -> ${tokensAfter} tokens`,
          );
        }
        return {
          recovered: true,
          messages: forceResult,
          reason: 'Force compacted conversation',
          tokensBefore,
          tokensAfter,
        };
      }
    }

    return {
      recovered: false,
      messages,
      reason: 'All reactive recovery strategies exhausted',
      tokensBefore,
      tokensAfter: tokensBefore,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private stripImages(messages: MessageObject[]): MessageObject[] {
    return messages.map(msg => {
      if (!msg || typeof msg.content !== 'object' || !Array.isArray(msg.content)) {
        return msg;
      }

      const filtered = msg.content.filter((block: any) => {
        if (!block) return true;
        if (
          block.type === 'image_url' ||
          block.type === 'image' ||
          (block.type === 'text' &&
            typeof block.text === 'string' &&
            block.text.startsWith('data:image'))
        ) {
          return false;
        }
        return true;
      });

      if (filtered.length === msg.content.length) {
        return msg;
      }

      if (filtered.length < msg.content.length) {
        filtered.push({
          type: 'text',
          text: `[${msg.content.length - filtered.length} image(s) removed due to size limits]`,
        });
      }

      return { ...msg, content: filtered };
    });
  }

  private stripOldestMessages(
    messages: MessageObject[],
  ): MessageObject[] | null {
    const systemMessages = messages.filter(m => m?.role === 'system');
    const nonSystemMessages = messages.filter(m => m?.role !== 'system');

    if (nonSystemMessages.length <= MIN_PRESERVED_MESSAGES) {
      return null;
    }

    const recentMessages = nonSystemMessages.slice(-MIN_PRESERVED_MESSAGES);
    const strippedCount = nonSystemMessages.length - MIN_PRESERVED_MESSAGES;

    return [
      ...systemMessages,
      {
        role: 'user' as const,
        content: `[Emergency context reduction: ${strippedCount} older messages removed due to context overflow. The current task context is preserved below.]`,
      },
      {
        role: 'assistant' as const,
        content: 'Understood. I will work with the available context.',
      },
      ...recentMessages,
    ];
  }

  private async forceCompact(
    messages: MessageObject[],
  ): Promise<MessageObject[] | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const codebolt = require('@codebolt/codeboltjs');

      const systemMessages = messages.filter(m => m?.role === 'system');
      const nonSystemMessages = messages.filter(m => m?.role !== 'system');

      if (nonSystemMessages.length <= MIN_PRESERVED_MESSAGES) {
        return null;
      }

      const toSummarize = nonSystemMessages.slice(0, -MIN_PRESERVED_MESSAGES);
      const toKeep = nonSystemMessages.slice(-MIN_PRESERVED_MESSAGES);

      const historyText = toSummarize
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

      const prompt = `Emergency context compression. Create a very concise summary preserving only:
1. The user's original task/request
2. Key files being worked on (paths)
3. Current state and next step
4. Any critical errors/blockers

Conversation:
${historyText}`;

      const response = await codebolt.llm.inference({
        messages: [
          {
            role: 'system',
            content:
              'Create an extremely concise summary. Focus on actionable facts only.',
          },
          { role: 'user', content: prompt },
        ],
      });

      let summary: string | undefined;
      if (typeof response?.completion?.content === 'string') {
        summary = response.completion.content;
      } else if (response?.completion?.choices?.[0]?.message?.content) {
        summary = response.completion.choices[0].message.content;
      }

      if (!summary || summary.trim().length === 0) {
        return null;
      }

      return [
        ...systemMessages,
        {
          role: 'user' as const,
          content: `[Emergency context recovery. Previous conversation summary:\n\n${summary}]\n\nRecent context continues below.`,
        },
        {
          role: 'assistant' as const,
          content: 'Understood. I have the compressed context and will continue.',
        },
        ...toKeep,
      ];
    } catch {
      return null;
    }
  }
}
