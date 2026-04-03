/**
 * Post-Compact Cleanup
 *
 * Resets ALL tracking state after any compaction event.
 * Called after both auto-compact and manual /compact to free memory
 * held by tracking structures that are invalidated by compaction.
 */

import type { CompactionLayerKind, CompactionLayer } from './types';

export interface PostCompactCleanupOptions {
  enableLogging?: boolean;
}

export class PostCompactCleanup {

  constructor(_options?: PostCompactCleanupOptions) {}

  runCleanup(
    layers: Map<CompactionLayerKind, CompactionLayer>,
    appliedLayers: CompactionLayerKind[],
  ): void {
    for (const layerName of appliedLayers) {
      const layer = layers.get(layerName);
      if (layer) {
        try {
          layer.reset();
        } catch {
          // Ignore
        }
      }
    }

    // Always reset reactive compact even if not applied
    const reactive = layers.get('reactive');
    if (reactive && !appliedLayers.includes('reactive')) {
      try {
        reactive.reset();
      } catch {
        // Ignore
      }
    }
  }
}
