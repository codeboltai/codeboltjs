import { BaseEnvironmentContextModifierNode } from '@agent-creator/shared-nodes';

// Frontend Environment Context Modifier Node - UI only
export class EnvironmentContextModifierNode extends BaseEnvironmentContextModifierNode {
  constructor() {
    super();
  }

  // Update node display when properties change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);

    // Update node size based on configuration
    this.updateNodeSize();

    return result;
  }

  // Update node size based on current configuration
  private updateNodeSize(): void {
    const hasCustomPatterns = (
      (this.properties.includePatterns as string[]).length > 0 ||
      (this.properties.excludePatterns as string[]).length > 0
    );

    if (hasCustomPatterns) {
      this.size = [280, 340];
    } else {
      this.size = [280, 320];
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const config = this.getEnvironmentContextConfig();
    const parts: string[] = [];

    if (config.enableFullContext) {
      parts.push('Full Context');
    } else {
      parts.push(`Max Files: ${config.maxFiles}`);
    }

    if (config.excludePatterns.length > 0) {
      parts.push(`Excludes: ${config.excludePatterns.length}`);
    }

    if (config.includePatterns.length > 0) {
      parts.push(`Includes: ${config.includePatterns.length}`);
    }

    return parts.join(', ') || 'Default';
  }

  // Render custom visualization if needed
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw a status indicator
    if (this.properties.enableFullContext) {
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(this.size[0] - 10, 10, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw configuration summary if there's space
    if (this.size[1] > 300) {
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      const summary = this.getConfigurationSummary();
      ctx.fillText(summary, 10, this.size[1] - 5);
    }
  }
}