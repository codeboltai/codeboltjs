import { BaseIdeContextModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend IDE Context Modifier Node - UI only
export class IdeContextModifierNode extends BaseIdeContextModifierNode {
  constructor() {
    super();
  }

  // Update node display when properties change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update node appearance based on configuration
    this.updateNodeAppearance();

    return result;
  }

  // Update node appearance based on current configuration
  private updateNodeAppearance(): void {
    const hasOpenFiles = this.properties.includeOpenFiles as boolean;
    const hasActiveFile = this.properties.includeActiveFile as boolean;
    const hasCursorPosition = this.properties.includeCursorPosition as boolean;
    const hasSelectedText = this.properties.includeSelectedText as boolean;

    // Count enabled features
    const featureCount = [hasOpenFiles, hasActiveFile, hasCursorPosition, hasSelectedText].filter(Boolean).length;

    // Change node color based on number of features enabled
    if (featureCount >= 3) {
      this.color = '#4CAF50'; // Green - fully configured
    } else if (featureCount >= 2) {
      this.color = '#FF9800'; // Orange - moderately configured
    } else if (featureCount >= 1) {
      this.color = '#F44336'; // Red - minimally configured
    } else {
      this.color = '#9E9E9E'; // Gray - no features
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    if (this.properties.includeOpenFiles) {
      parts.push(`Files: ${this.properties.maxOpenFiles}`);
    }

    if (this.properties.includeActiveFile) {
      parts.push('Active');
    }

    if (this.properties.includeCursorPosition) {
      parts.push('Cursor');
    }

    if (this.properties.includeSelectedText) {
      parts.push('Selection');
    }

    return parts.length > 0 ? parts.join(', ') : 'No features';
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw IDE/editor icon
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(12, 12, 20, 14);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(14, 14, 16, 10);

    // Draw code lines
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(16, 16, 4, 1);
    ctx.fillRect(16, 18, 8, 1);
    ctx.fillRect(16, 20, 6, 1);
    ctx.fillRect(16, 22, 10, 1);

    // Draw feature indicators in a grid
    const features = [
      { enabled: this.properties.includeOpenFiles, label: 'Files', color: '#4CAF50' },
      { enabled: this.properties.includeActiveFile, label: 'Active', color: '#2196F3' },
      { enabled: this.properties.includeCursorPosition, label: 'Cursor', color: '#FF9800' },
      { enabled: this.properties.includeSelectedText, label: 'Selection', color: '#9C27B0' }
    ];

    let xOffset = 35;
    let yOffset = 20;

    features.forEach((feature, _index) => {
      if (feature.enabled) {
        ctx.fillStyle = feature.color;
        ctx.beginPath();
        ctx.arc(xOffset, yOffset, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#666';
        ctx.font = '8px Arial';
        ctx.fillText(feature.label, xOffset - 12, yOffset + 12);

        xOffset += 25;
        if (xOffset > this.size[0] - 20) {
          xOffset = 35;
          yOffset += 20;
        }
      }
    });

    // Draw max files indicator if open files are enabled
    if (this.properties.includeOpenFiles) {
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.fillText(`Max: ${this.properties.maxOpenFiles}`, 10, this.size[1] - 5);
    } else {
      // Draw configuration summary
      const summary = this.getConfigurationSummary();
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.fillText(summary, 10, this.size[1] - 5);
    }
  }
}