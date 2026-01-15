import { BaseArgumentProcessorModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend Argument Processor Modifier Node - UI only
export class ArgumentProcessorModifierNode extends BaseArgumentProcessorModifierNode {
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
    const formatStyle = this.properties.formatStyle as string;

    // Change node color based on format style
    switch (formatStyle) {
      case 'detailed':
        this.color = '#4CAF50'; // Green - detailed format
        break;
      case 'json':
        this.color = '#2196F3'; // Blue - JSON format
        break;
      case 'simple':
      default:
        this.color = '#FF9800'; // Orange - simple format
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

    const formatStyle = this.properties.formatStyle as string;
    parts.push(formatStyle.charAt(0).toUpperCase() + formatStyle.slice(1));

    if (!this.properties.appendRawInvocation) {
      parts.push('No Raw');
    }

    if (!this.properties.includeCommandName) {
      parts.push('No Command');
    }

    const separator = this.properties.argumentSeparator as string;
    if (separator !== ', ') {
      parts.push(`Sep: "${separator}"`);
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw gear icon for configuration
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(20, 20, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.save();
      ctx.translate(20, 20);
      ctx.rotate(angle);
      ctx.fillRect(-2, -10, 4, 20);
      ctx.restore();
    }

    // Draw format style indicator
    const formatStyle = this.properties.formatStyle as string;
    let formatColor = '#666';

    switch (formatStyle) {
      case 'detailed':
        formatColor = '#4CAF50';
        break;
      case 'json':
        formatColor = '#2196F3';
        break;
      case 'simple':
        formatColor = '#FF9800';
        break;
    }

    ctx.fillStyle = formatColor;
    ctx.fillRect(35, 16, 50, 8);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px Arial';
    ctx.fillText(formatStyle.toUpperCase(), 40, 22);

    // Draw feature indicators
    let yOffset = 40;

    if (this.properties.appendRawInvocation) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.size[0] - 60, yOffset - 6, 50, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Raw', this.size[0] - 58, yOffset + 2);
      yOffset += 16;
    }

    if (this.properties.includeCommandName) {
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(this.size[0] - 60, yOffset - 6, 50, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Command', this.size[0] - 58, yOffset + 2);
    }

    // Draw separator indicator
    const separator = this.properties.argumentSeparator as string;
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`Sep: "${separator}"`, 35, 38);

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}