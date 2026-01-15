import { BaseLoopDetectionModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend Loop Detection Modifier Node - UI only
export class LoopDetectionModifierNode extends BaseLoopDetectionModifierNode {
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
    const detectionMode = this.properties.detectionMode as string;
    const autoBreak = this.properties.enableAutoBreak as boolean;
    const threshold = this.properties.similarityThreshold as number;

    // Change node color based on detection mode and sensitivity
    if (autoBreak && threshold >= 0.9) {
      this.color = '#F44336'; // Red - high sensitivity with auto-break
    } else if (autoBreak && threshold >= 0.8) {
      this.color = '#FF9800'; // Orange - medium sensitivity with auto-break
    } else if (autoBreak) {
      this.color = '#4CAF50'; // Green - low sensitivity with auto-break
    } else if (detectionMode === 'semantic') {
      this.color = '#2196F3'; // Blue - semantic detection
    } else {
      this.color = '#9C27B0'; // Purple - content detection
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    const mode = this.properties.detectionMode as string;
    parts.push(mode.charAt(0).toUpperCase() + mode.slice(1));

    const threshold = this.properties.similarityThreshold as number;
    parts.push(`${(threshold * 100).toFixed(0)}% similarity`);

    const timeWindow = this.properties.timeWindowMinutes as number;
    parts.push(`${timeWindow}min window`);

    if (this.properties.enableAutoBreak) {
      parts.push('Auto-break');
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw loop detection icon (circular arrows)
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 3;

    // Draw circular arrow
    ctx.beginPath();
    ctx.arc(20, 20, 10, Math.PI * 0.2, Math.PI * 1.8);
    ctx.stroke();

    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(28, 15);
    ctx.lineTo(32, 18);
    ctx.lineTo(30, 13);
    ctx.closePath();
    ctx.fillStyle = '#FF9800';
    ctx.fill();

    // Draw detection mode indicator
    const mode = this.properties.detectionMode as string;
    let modeColor = '#666';

    switch (mode) {
      case 'semantic':
        modeColor = '#4CAF50';
        break;
      case 'hybrid':
        modeColor = '#2196F3';
        break;
      case 'content':
        modeColor = '#9C27B0';
        break;
    }

    ctx.fillStyle = modeColor;
    ctx.fillRect(35, 16, 50, 8);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px Arial';
    ctx.fillText(mode.toUpperCase(), 40, 22);

    // Draw similarity threshold
    const threshold = this.properties.similarityThreshold as number;
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`${(threshold * 100).toFixed(0)}% similarity`, 35, 38);

    // Draw status indicators
    let yOffset = 50;

    if (this.properties.enableAutoBreak) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Auto-Break', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    // Draw time window indicator
    const timeWindow = this.properties.timeWindowMinutes as number;
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
    ctx.fillStyle = '#FFF';
    ctx.font = '9px Arial';
    ctx.fillText(`${timeWindow}min`, this.size[0] - 58, yOffset + 2);

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}