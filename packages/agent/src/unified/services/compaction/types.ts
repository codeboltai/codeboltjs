/**
 * Multi-Layer Compaction Types
 *
 * Shared types for the 5-layer defense-in-depth compaction system.
 */

import type { MessageObject } from '@codebolt/types/sdk';

// ─── Token Estimation ────────────────────────────────────────────────

export class TokenEstimator {
  private charsPerToken = 4;

  estimate(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / this.charsPerToken);
  }

  estimateForMessages(messages: MessageObject[]): number {
    if (!messages || !Array.isArray(messages)) return 0;
    return messages.reduce((total, msg) => {
      if (!msg) return total;
      const content =
        typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content ?? '');
      return total + this.estimate(content) + 4;
    }, 0);
  }

  calibrate(estimatedTokens: number, actualTokens: number): void {
    if (actualTokens <= 0 || estimatedTokens <= 0) return;
    const ratio = estimatedTokens / actualTokens;
    this.charsPerToken = Math.max(2, Math.min(6, this.charsPerToken * ratio));
  }
}

// ─── Layer Kind ─────────────────────────────────────────────────────

export type CompactionLayerKind =
  | 'snip'
  | 'micro'
  | 'collapse'
  | 'auto'
  | 'reactive';

// ─── Compaction Boundary ────────────────────────────────────────────

export interface CompactionBoundary {
  /** Which layer produced this boundary */
  layer: CompactionLayerKind;
  /** Approximate tokens freed by this compaction */
  tokensFreed: number;
  /** Number of messages removed */
  messagesRemoved: number;
  /** ISO timestamp */
  timestamp: string;
  /** For auto-compact: whether a summary was included */
  summaryIncluded?: boolean;
  /** For collapse: number of granular summaries committed */
  committed?: number;
}

// ─── Compaction Context ─────────────────────────────────────────────

export interface CompactionContext {
  /** Current messages to evaluate/compress */
  messages: MessageObject[];
  /** Tokens freed by snip compact (layer 1) */
  snipTokensFreed?: number;
  /** Whether context collapse is enabled (suppresses auto-compact when true) */
  contextCollapseEnabled?: boolean;
  /** Compaction history (boundaries applied so far) */
  compactionHistory?: CompactionBoundary[];
  /** Auto-compact tracking state */
  autoCompactTracking?: {
    compacted: boolean;
    turnId: string;
    turnCounter: number;
    consecutiveFailures: number;
  };
}

// ─── Compaction Orchestrator Options ────────────────────────────────

export interface CompactionOrchestratorOptions {
  modelTokenLimit?: number;
  autoCompactEnabled?: boolean;
  autoCompactBufferTokens?: number;
  maxConsecutiveFailures?: number;
  snipEnabled?: boolean;
  microCompactEnabled?: boolean;
  contextCollapseEnabled?: boolean;
  microCompactGapMinutes?: number;
  microCompactKeepRecent?: number;
  collapseCommitThreshold?: number;
  collapseBlockingThreshold?: number;
  reactiveRetryLimit?: number;
  llmRole?: string;
  enableLogging?: boolean;
}

// ─── Layer Interface ─────────────────────────────────────────────────

export interface CompactionLayer {
  readonly name: CompactionLayerKind;
  shouldApply(ctx: CompactionContext): boolean;
  apply(ctx: CompactionContext): Promise<CompactionContext>;
  reset(): void;
}
