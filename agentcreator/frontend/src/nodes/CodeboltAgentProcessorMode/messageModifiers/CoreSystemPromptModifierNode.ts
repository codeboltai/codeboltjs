import { BaseCoreSystemPromptModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend Core System Prompt Modifier Node - UI only
export class CoreSystemPromptModifierNode extends BaseCoreSystemPromptModifierNode {
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
    const hasCustomPrompt = this.properties.enableCustomPrompt as boolean;
    const hasUserMemory = this.properties.enableUserMemory as boolean;

    // Change node color based on configuration
    if (hasCustomPrompt && hasUserMemory) {
      this.color = '#4CAF50'; // Green - fully configured
    } else if (hasCustomPrompt || hasUserMemory) {
      this.color = '#FF9800'; // Orange - partially configured
    } else {
      this.color = '#9E9E9E'; // Gray - default
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    if (this.properties.enableCustomPrompt) {
      const customPrompt = this.properties.customSystemPrompt as string;
      parts.push(`Custom: ${customPrompt.length > 20 ? customPrompt.substring(0, 20) + '...' : customPrompt}`);
    }

    if (this.properties.enableUserMemory) {
      const userMemory = this.properties.userMemory as string;
      parts.push(`Memory: ${userMemory.length > 20 ? userMemory.substring(0, 20) + '...' : userMemory}`);
    }

    if (parts.length === 0) {
      parts.push('Default Prompt');
    }

    return parts.join(' | ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw status indicators
    let yOffset = 20;

    // Custom prompt indicator
    if (this.properties.enableCustomPrompt) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.size[0] - 60, yOffset - 8, 50, 16);
      ctx.fillStyle = '#FFF';
      ctx.font = '10px Arial';
      ctx.fillText('Custom', this.size[0] - 55, yOffset + 2);
      yOffset += 20;
    }

    // User memory indicator
    if (this.properties.enableUserMemory) {
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(this.size[0] - 60, yOffset - 8, 50, 16);
      ctx.fillStyle = '#FFF';
      ctx.font = '10px Arial';
      ctx.fillText('Memory', this.size[0] - 55, yOffset + 2);
    }

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}