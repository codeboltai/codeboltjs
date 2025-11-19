import { BaseDirectoryContextModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend Directory Context Modifier Node - UI only
export class DirectoryContextModifierNode extends BaseDirectoryContextModifierNode {
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
    const hasGitignore = this.properties.enableGitignore as boolean;
    const hasCustomDirectories = (this.properties.workspaceDirectories as string[]).length > 0;

    // Change node color based on configuration
    if (hasCustomDirectories && hasGitignore) {
      this.color = '#4CAF50'; // Green - fully configured
    } else if (hasCustomDirectories || hasGitignore) {
      this.color = '#FF9800'; // Orange - partially configured
    } else {
      this.color = '#2196F3'; // Blue - default configuration
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    const maxDepth = this.properties.maxDepth as number;
    parts.push(`Depth: ${maxDepth}`);

    if (this.properties.enableGitignore) {
      parts.push('Gitignore');
    }

    if (this.properties.showFileSizes) {
      parts.push('Sizes');
    }

    if (this.properties.includeHidden) {
      parts.push('Hidden');
    }

    const dirCount = (this.properties.workspaceDirectories as string[]).length;
    if (dirCount > 0) {
      parts.push(`Dirs: ${dirCount}`);
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw directory icon
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.lineTo(15, 35);
    ctx.lineTo(25, 35);
    ctx.lineTo(25, 20);
    ctx.lineTo(20, 20);
    ctx.lineTo(20, 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('D', 18, 28);

    // Draw depth indicator
    const maxDepth = this.properties.maxDepth as number;
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`Depth: ${maxDepth}`, 35, 25);

    // Draw status indicators
    let yOffset = 40;

    if (this.properties.enableGitignore) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('Gitignore', this.size[0] - 68, yOffset + 2);
      yOffset += 16;
    }

    if (this.properties.showFileSizes) {
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText('File Sizes', this.size[0] - 68, yOffset + 2);
    }

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}