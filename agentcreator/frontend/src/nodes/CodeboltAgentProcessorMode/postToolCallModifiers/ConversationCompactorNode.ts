import { BaseConversationCompactorNode } from '@codebolt/agent-shared-nodes';

// Frontend Conversation Compactor Node - UI only
export class ConversationCompactorNode extends BaseConversationCompactorNode {
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
    const strategy = this.properties.compactionStrategy as string;

    // Change node color based on compaction strategy
    switch (strategy) {
      case 'important':
        this.color = '#4CAF50'; // Green - importance-based compaction
        break;
      case 'summarize':
        this.color = '#2196F3'; // Blue - summarization-based compaction
        break;
      case 'recent':
        this.color = '#FF9800'; // Orange - recency-based compaction
        break;
      case 'hybrid':
      default:
        this.color = '#9C27B0'; // Purple - hybrid compaction
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

    const strategy = this.properties.compactionStrategy as string;
    parts.push(strategy.charAt(0).toUpperCase() + strategy.slice(1));

    const maxLength = this.properties.maxConversationLength as number;
    parts.push(`Max: ${maxLength}`);

    const ratio = this.properties.compressionRatio as number;
    parts.push(`${(ratio * 100).toFixed(0)}%`);

    if (this.properties.preserveToolCalls) {
      parts.push('Keep Tools');
    }

    if (this.properties.preserveErrors) {
      parts.push('Keep Errors');
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw compaction icon (arrows pointing inward)
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;

    // Draw box representing conversation
    ctx.strokeRect(12, 12, 20, 20);

    // Draw compression arrows
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.lineTo(12, 22);
    ctx.moveTo(10, 20);
    ctx.lineTo(12, 22);
    ctx.lineTo(10, 24);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(32, 22);
    ctx.lineTo(36, 22);
    ctx.moveTo(34, 20);
    ctx.lineTo(36, 22);
    ctx.lineTo(34, 24);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(22, 8);
    ctx.lineTo(22, 12);
    ctx.moveTo(20, 10);
    ctx.lineTo(22, 12);
    ctx.lineTo(24, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(22, 32);
    ctx.lineTo(22, 36);
    ctx.moveTo(20, 34);
    ctx.lineTo(22, 36);
    ctx.lineTo(24, 34);
    ctx.stroke();

    // Draw strategy indicator
    const strategy = this.properties.compactionStrategy as string;
    let strategyColor = '#666';

    switch (strategy) {
      case 'important':
        strategyColor = '#4CAF50';
        break;
      case 'summarize':
        strategyColor = '#2196F3';
        break;
      case 'recent':
        strategyColor = '#FF9800';
        break;
      case 'hybrid':
        strategyColor = '#9C27B0';
        break;
    }

    ctx.fillStyle = strategyColor;
    ctx.fillRect(35, 16, 50, 8);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px Arial';
    ctx.fillText(strategy.toUpperCase(), 40, 22);

    // Draw feature indicators
    let yOffset = 50;

    if (this.properties.preserveToolCalls) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Keep Tools', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    if (this.properties.preserveErrors) {
      ctx.fillStyle = '#F44336';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Keep Errors', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    // Draw compression ratio
    const ratio = this.properties.compressionRatio as number;
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
    ctx.fillStyle = '#FFF';
    ctx.font = '9px Arial';
    ctx.fillText(`${(ratio * 100).toFixed(0)}% Ratio`, this.size[0] - 68, yOffset + 2);

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}