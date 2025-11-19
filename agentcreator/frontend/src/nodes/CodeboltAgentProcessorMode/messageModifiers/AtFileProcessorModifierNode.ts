import { BaseAtFileProcessorModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend @File Processor Modifier Node - UI only
export class AtFileProcessorModifierNode extends BaseAtFileProcessorModifierNode {
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
    const hasRecursiveSearch = this.properties.enableRecursiveSearch as boolean;
    const hasLineNumbers = this.properties.includeLineNumbers as boolean;
    const hasCustomExtensions = (this.properties.allowedExtensions as string[]).length > 10;

    // Change node color based on configuration complexity
    if (hasRecursiveSearch && hasLineNumbers && hasCustomExtensions) {
      this.color = '#4CAF50'; // Green - advanced configuration
    } else if (hasRecursiveSearch || hasLineNumbers || hasCustomExtensions) {
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

    const maxFileSize = this.properties.maxFileSize as number;
    parts.push(`${(maxFileSize / 1024 / 1024).toFixed(1)}MB`);

    const extCount = (this.properties.allowedExtensions as string[]).length;
    parts.push(`${extCount} types`);

    if (this.properties.enableRecursiveSearch) {
      parts.push('Recursive');
    }

    if (this.properties.includeLineNumbers) {
      parts.push('Lines');
    }

    const maxContent = this.properties.maxFileContent as number;
    parts.push(`${(maxContent / 1024).toFixed(0)}KB`);

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw file icon
    ctx.fillStyle = '#FF9800';
    ctx.fillRect(12, 12, 16, 20);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(14, 14, 12, 16);

    // Draw @ symbol
    ctx.fillStyle = '#FF9800';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('@', 17, 24);

    // Draw feature indicators
    let yOffset = 40;

    if (this.properties.enableRecursiveSearch) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Recursive', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    if (this.properties.includeLineNumbers) {
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Line Numbers', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    // Draw extension count
    const extCount = (this.properties.allowedExtensions as string[]).length;
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
    ctx.fillStyle = '#FFF';
    ctx.font = '9px Arial';
    ctx.fillText(`${extCount} Extensions`, this.size[0] - 68, yOffset + 2);

    // Draw file size indicator
    const maxSizeMB = (this.properties.maxFileSize as number) / 1024 / 1024;
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`Max: ${maxSizeMB.toFixed(1)}MB`, 35, 25);

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}