import { BaseToolInjectionModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend Tool Injection Modifier Node - UI only
export class ToolInjectionModifierNode extends BaseToolInjectionModifierNode {
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
    const hasFilters = (this.properties.enabledCategories as string[]).length > 0;
    const hasExamples = this.properties.giveToolExamples as boolean;

    // Change node color based on configuration complexity
    if (hasFilters && hasExamples) {
      this.color = '#4CAF50'; // Green - advanced configuration
    } else if (hasFilters || hasExamples) {
      this.color = '#FF9800'; // Orange - moderate configuration
    } else {
      this.color = '#2196F3'; // Blue - simple configuration
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    const location = this.properties.toolsLocation as string;
    parts.push(location.charAt(0).toUpperCase() + location.slice(1));

    if (!this.properties.includeToolDescriptions) {
      parts.push('No Descriptions');
    }

    if (this.properties.giveToolExamples) {
      parts.push(`Examples: ${this.properties.maxToolExamples}`);
    }

    if ((this.properties.enabledCategories as string[]).length > 0) {
      parts.push(`Filters: ${(this.properties.enabledCategories as string[]).length}`);
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw location indicator
    const location = this.properties.toolsLocation as string;
    let locationColor = '#2196F3'; // Default blue

    switch (location) {
      case 'beginning':
        locationColor = '#4CAF50'; // Green
        break;
      case 'end':
        locationColor = '#FF9800'; // Orange
        break;
      case 'smart':
        locationColor = '#9C27B0'; // Purple
        break;
    }

    // Draw location badge
    ctx.fillStyle = locationColor;
    ctx.beginPath();
    ctx.arc(this.size[0] - 30, 20, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(location.charAt(0).toUpperCase(), this.size[0] - 30, 23);
    ctx.textAlign = 'left';

    // Draw feature indicators
    let yOffset = 40;

    if (this.properties.includeToolDescriptions) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Descriptions', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    if (this.properties.giveToolExamples) {
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Examples', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    if ((this.properties.enabledCategories as string[]).length > 0) {
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      const filterCount = (this.properties.enabledCategories as string[]).length;
      ctx.fillText(`Filters: ${filterCount}`, this.size[0] - 68, yOffset + 2);
    }

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}