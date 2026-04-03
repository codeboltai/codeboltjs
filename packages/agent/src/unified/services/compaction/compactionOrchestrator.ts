/**
 * Compaction Orchestrator
 *
 * Coordinates the 5-layer defense-in-depth compaction system.
 * Layers execute cheapest-first: snip -> micro -> collapse -> auto -> reactive
 *
 * The orchestrator:
 *   1. Runs each layer's shouldApply() check
 *   2. Applies layers in priority order
 *   3. Passes each layer's savings to subsequent layers via CompactionContext
 *   4. Runs post-compact cleanup after any layer is applied
 *   5. Provides reactive recovery for API 413 errors
 */

import type { MessageObject } from '@codebolt/types/sdk';
import {
  type CompactionContext,
  type CompactionBoundary,
  type CompactionLayerKind,
  type CompactionLayer,
  type CompactionOrchestratorOptions,
} from './types';

import { SnipCompact } from './snipCompact';
import { MicroCompact } from './microCompact';
import { ContextCollapse } from './contextCollapse';
import { AutoCompact } from './autoCompact';
import { ReactiveCompact } from './reactiveCompact';
import { PostCompactCleanup } from './postCompactCleanup';

export interface CompactionPipelineResult {
  /** Final messages after all applied layers */
  messages: MessageObject[];
  /** Total tokens freed across all layers */
  totalTokensFreed: number;
  /** Layers that were applied, in order */
  layersApplied: CompactionLayerKind[];
  /** Compaction boundaries for telemetry */
  boundaries: CompactionBoundary[];
  /** Whether any compaction occurred */
  wasCompacted: boolean;
}

const DEFAULT_MODEL_TOKEN_LIMIT = 128_000;

export class CompactionOrchestrator {
  private readonly snip: SnipCompact;
  private readonly micro: MicroCompact;
  private readonly collapse: ContextCollapse;
  private readonly auto: AutoCompact;
  private readonly reactive: ReactiveCompact;
  private readonly cleanup: PostCompactCleanup;
  private readonly options: {
    modelTokenLimit: number;
    autoCompactEnabled: boolean;
    contextCollapseEnabled: boolean;
    enableLogging: boolean;
  };

  /** Layer execution order (cheapest first) */
  private readonly layerOrder: CompactionLayerKind[] = [
    'snip',
    'micro',
    'collapse',
    'auto',
  ];

  private readonly layers: Map<CompactionLayerKind, CompactionLayer>;

  constructor(options?: CompactionOrchestratorOptions) {
    this.options = {
      modelTokenLimit: options?.modelTokenLimit ?? DEFAULT_MODEL_TOKEN_LIMIT,
      autoCompactEnabled: options?.autoCompactEnabled ?? true,
      contextCollapseEnabled: options?.contextCollapseEnabled ?? false,
      enableLogging: options?.enableLogging ?? false,
    };

    this.snip = new SnipCompact({ enableLogging: this.options.enableLogging });
    this.micro = new MicroCompact({ enableLogging: this.options.enableLogging });
    this.collapse = new ContextCollapse({
      modelTokenLimit: this.options.modelTokenLimit,
      enableLogging: this.options.enableLogging,
    });
    this.auto = new AutoCompact({
      modelTokenLimit: this.options.modelTokenLimit,
      enableLogging: this.options.enableLogging,
    });
    this.reactive = new ReactiveCompact({
      modelTokenLimit: this.options.modelTokenLimit,
      enableLogging: this.options.enableLogging,
    });
    this.cleanup = new PostCompactCleanup({
      enableLogging: this.options.enableLogging,
    });

    const layerEntries: Array<[CompactionLayerKind, CompactionLayer]> = [
      ['snip', this.snip],
      ['micro', this.micro],
      ['collapse', this.collapse],
      ['auto', this.auto],
      ['reactive', this.reactive],
    ];

    this.layers = new Map(layerEntries);
  }

  /**
   * Run the full compaction pipeline.
   * Each layer is checked and applied in priority order.
   * If any layer reduces messages, subsequent layers see the reduced set.
   */
  async compact(messages: MessageObject[]): Promise<CompactionPipelineResult> {
    let ctx: CompactionContext = {
      messages,
      snipTokensFreed: 0,
      contextCollapseEnabled: this.options.contextCollapseEnabled,
      compactionHistory: [],
      autoCompactTracking: {
        compacted: false,
        turnId: `turn-${Date.now()}`,
        turnCounter: 0,
        consecutiveFailures: 0,
      },
    };

    const layersApplied: CompactionLayerKind[] = [];
    const boundaries: CompactionBoundary[] = [];
    let totalTokensFreed = 0;

    for (const layerName of this.layerOrder) {
      // Skip auto-compact if disabled or if context collapse is handling it
      if (layerName === 'auto' && !this.options.autoCompactEnabled) continue;
      if (layerName === 'auto' && this.options.contextCollapseEnabled) continue;
      if (layerName === 'collapse' && !this.options.contextCollapseEnabled) continue;

      const layer = this.layers.get(layerName);
      if (!layer) continue;

      if (layer.shouldApply(ctx)) {
        try {
          const prevLength = ctx.messages.length;
          ctx = await layer.apply(ctx);

          // Track what was applied
          if (ctx.messages.length !== prevLength || ctx.compactionHistory) {
            layersApplied.push(layerName);

            // Get the latest boundary
            const latestBoundary = ctx.compactionHistory?.at(-1);
            if (latestBoundary) {
              boundaries.push(latestBoundary);
              totalTokensFreed += latestBoundary.tokensFreed;
            }
          }
        } catch (error) {
          if (this.options.enableLogging) {
            console.error(
              `[CompactionOrchestrator] Layer ${layerName} failed:`,
              error,
            );
          }
        }
      }
    }

    // Run post-compact cleanup
    if (layersApplied.length > 0) {
      this.cleanup.runCleanup(this.layers, layersApplied);
    }

    const wasCompacted = layersApplied.length > 0;

    if (wasCompacted && this.options.enableLogging) {
      console.log(
        `[CompactionOrchestrator] Compacted: layers=[${layersApplied.join(',')}], tokensFreed=${totalTokensFreed}`,
      );
    }

    return {
      messages: ctx.messages,
      totalTokensFreed,
      layersApplied,
      boundaries,
      wasCompacted,
    };
  }

  /**
   * Attempt reactive recovery from an API error.
   * Only called when the proactive pipeline didn't prevent overflow.
   */
  async recoverFromError(
    messages: MessageObject[],
    error: unknown,
  ): Promise<CompactionPipelineResult> {
    const ctx: CompactionContext = {
      messages,
      contextCollapseEnabled: this.options.contextCollapseEnabled,
      compactionHistory: [],
    };

    // First try context collapse recovery (cheap: drain staged collapses)
    if (this.options.contextCollapseEnabled) {
      const collapseResult = this.collapse.recoverFromOverflow(messages);
      if (collapseResult.committed > 0) {
        return {
          messages: collapseResult.messages,
          totalTokensFreed: 0, // Already accounted for in collapse
          layersApplied: ['collapse'],
          boundaries: [{
            layer: 'collapse',
            tokensFreed: 0,
            messagesRemoved: 0,
            timestamp: new Date().toISOString(),
            committed: collapseResult.committed,
          }],
          wasCompacted: true,
        };
      }
    }

    // Fall through to reactive compact
    const result = await this.reactive.tryRecoverFromError(ctx, error);

    if (result.recovered) {
      this.reactive.resetForTurn();

      return {
        messages: result.messages,
        totalTokensFreed: result.tokensBefore - result.tokensAfter,
        layersApplied: ['reactive'],
        boundaries: [{
          layer: 'reactive',
          tokensFreed: result.tokensBefore - result.tokensAfter,
          messagesRemoved: 0,
          timestamp: new Date().toISOString(),
        }],
        wasCompacted: true,
      };
    }

    return {
      messages,
      totalTokensFreed: 0,
      layersApplied: [],
      boundaries: [],
      wasCompacted: false,
    };
  }

  /**
   * Get the current auto-compact tracking state.
   */
  getAutoCompactTracking() {
    return this.auto.getTracking();
  }

  /**
   * Get the number of consecutive auto-compact failures.
   */
  getConsecutiveFailures() {
    return this.auto.getConsecutiveFailures();
  }

  /**
   * Reset the reactive compact's per-turn guard.
   * Call at the start of each new turn.
   */
  resetForTurn(): void {
    this.reactive.resetForTurn();
  }

  /**
   * Reset all compaction state.
   */
  resetAll(): void {
    for (const [, layer] of this.layers) {
      try {
        layer.reset();
      } catch {
        // Ignore
      }
    }
  }

  // ─── Convenience Accessors ──────────────────────────────────────

  getSnipLayer(): SnipCompact { return this.snip; }
  getMicroLayer(): MicroCompact { return this.micro; }
  getCollapseLayer(): ContextCollapse { return this.collapse; }
  getAutoLayer(): AutoCompact { return this.auto; }
  getReactiveLayer(): ReactiveCompact { return this.reactive; }
}
