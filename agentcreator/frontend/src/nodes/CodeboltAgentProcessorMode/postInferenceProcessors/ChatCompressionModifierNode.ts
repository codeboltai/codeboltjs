import { BaseChatCompressionModifierNode } from '@agent-creator/shared-nodes';

// Frontend Chat Compression Modifier Node - UI only
export class ChatCompressionModifierNode extends BaseChatCompressionModifierNode {
  constructor() {
    super();
  }

  // Update node display when properties change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);

    // Update node appearance based on configuration
    this.updateNodeAppearance();

    return result;
  }

  // Update node appearance based on current configuration
  private updateNodeAppearance(): void {
    const strategy = this.properties.compressionStrategy as string;
    const compressionRatio = this.properties.compressionRatio as number;

    // Change node color based on compression strategy
    switch (strategy) {
      case 'semantic':
        this.color = '#4CAF50'; // Green - semantic compression
        break;
      case 'hybrid':
        this.color = '#2196F3'; // Blue - hybrid compression
        break;
      case 'simple':
      default:
        this.color = '#FF9800'; // Orange - simple compression
        break;
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    const strategy = this.properties.compressionStrategy as string;
    parts.push(strategy.charAt(0).toUpperCase() + strategy.slice(1));

    const threshold = this.properties.tokenThreshold as number;
    parts.push(`${(threshold / 1000).toFixed(1)}K tokens`);

    const ratio = this.properties.compressionRatio as number;
    parts.push(`${(ratio * 100).toFixed(0)}% preserve`);

    const preserve = this.properties.preserveRecentMessages as number;
    parts.push(`${preserve} recent`);

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw compression icon
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.lineTo(15, 25);
    ctx.lineTo(20, 30);
    ctx.lineTo(25, 25);
    ctx.lineTo(25, 15);
    ctx.closePath();
    ctx.fill();

    // Draw compression arrows
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(22, 22);
    ctx.moveTo(22, 18);
    ctx.lineTo(18, 22);
    ctx.stroke();

    // Draw strategy indicator
    const strategy = this.properties.compressionStrategy as string;
    let strategyColor = '#666';

    switch (strategy) {
      case 'semantic':
        strategyColor = '#4CAF50';
        break;
      case 'hybrid':
        strategyColor = '#2196F3';
        break;
      case 'simple':
        strategyColor = '#FF9800';
        break;
    }

    ctx.fillStyle = strategyColor;
    ctx.fillRect(35, 16, 50, 8);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px Arial';
    ctx.fillText(strategy.toUpperCase(), 40, 22);

    // Draw threshold indicator
    const threshold = this.properties.tokenThreshold as number;
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`${(threshold / 1000).toFixed(1)}K tokens`, 35, 38);

    // Draw compression ratio
    const ratio = this.properties.compressionRatio as number;
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(this.size[0] - 70, 40, 60, 12);
    ctx.fillStyle = '#FFF';
    ctx.font = '9px Arial';
    ctx.fillText(`${(ratio * 100).toFixed(0)}% Preserve`, this.size[0] - 68, 49);

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}