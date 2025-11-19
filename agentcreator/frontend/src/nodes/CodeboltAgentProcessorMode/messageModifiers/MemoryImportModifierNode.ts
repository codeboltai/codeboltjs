import { BaseMemoryImportModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend Memory Import Modifier Node - UI only
export class MemoryImportModifierNode extends BaseMemoryImportModifierNode {
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
    const memoryEnabled = this.properties.enableMemoryImport as boolean;
    const recursiveSearch = this.properties.recursiveSearch as boolean;
    const maxImports = this.properties.maxImports as number;

    // Change node color based on configuration complexity
    if (memoryEnabled && recursiveSearch && maxImports > 10) {
      this.color = '#4CAF50'; // Green - advanced configuration
    } else if (memoryEnabled && (recursiveSearch || maxImports > 10)) {
      this.color = '#FF9800'; // Orange - moderate configuration
    } else if (memoryEnabled) {
      this.color = '#2196F3'; // Blue - basic configuration
    } else {
      this.color = '#9E9E9E'; // Gray - disabled
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    if (this.properties.enableMemoryImport) {
      const maxSize = this.properties.maxFileSize as number;
      parts.push(`${(maxSize / 1024).toFixed(0)}KB`);

      const extCount = (this.properties.allowedExtensions as string[]).length;
      parts.push(`${extCount} types`);

      const maxImports = this.properties.maxImports as number;
      parts.push(`${maxImports} max`);

      if (this.properties.recursiveSearch) {
        parts.push('Recursive');
      }
    } else {
      parts.push('Disabled');
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw brain/memory icon
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(20, 20, 12, 0, Math.PI, true);
    ctx.fill();

    // Brain lobes
    ctx.beginPath();
    ctx.arc(12, 20, 8, 0, Math.PI, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28, 20, 8, 0, Math.PI, true);
    ctx.fill();

    // Memory patterns
    ctx.fillStyle = '#FFF';
    ctx.fillRect(16, 16, 2, 2);
    ctx.fillRect(20, 14, 2, 2);
    ctx.fillRect(24, 16, 2, 2);

    // Draw feature indicators
    let yOffset = 40;

    if (this.properties.enableMemoryImport) {
      const maxSize = this.properties.maxFileSize as number;
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText(`${(maxSize / 1024).toFixed(0)}KB max`, this.size[0] - 68, yOffset + 2);
      yOffset += 16;

      if (this.properties.recursiveSearch) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.fillText('Recursive', this.size[0] - 68, yOffset + 2);
        yOffset += 16;
      }

      const extCount = (this.properties.allowedExtensions as string[]).length;
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText(`${extCount} extensions`, this.size[0] - 68, yOffset + 2);
    }

    // Draw import limit indicator
    const maxImports = this.properties.maxImports as number;
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`Max: ${maxImports} imports`, 35, 25);

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}