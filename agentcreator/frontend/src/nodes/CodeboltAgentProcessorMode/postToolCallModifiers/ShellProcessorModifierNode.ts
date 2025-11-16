import { BaseShellProcessorModifierNode } from '@agent-creator/shared-nodes';

// Frontend Shell Processor Modifier Node - UI only
export class ShellProcessorModifierNode extends BaseShellProcessorModifierNode {
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
    const shellEnabled = this.properties.enableShellExecution as boolean;
    const allowFileMod = this.properties.allowFileModification as boolean;
    const timeout = this.properties.timeoutSeconds as number;

    // Change node color based on security level
    if (shellEnabled && allowFileMod) {
      this.color = '#F44336'; // Red - high risk (shell + file modification)
    } else if (shellEnabled && timeout > 60) {
      this.color = '#FF9800'; // Orange - medium risk (long timeout)
    } else if (shellEnabled) {
      this.color = '#4CAF50'; // Green - low risk (limited execution)
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

    if (this.properties.enableShellExecution) {
      parts.push('Shell Enabled');

      const timeout = this.properties.timeoutSeconds as number;
      parts.push(`${timeout}s timeout`);

      const allowedCount = (this.properties.allowedCommands as string[]).length;
      parts.push(`${allowedCount} allowed`);

      if (this.properties.allowFileModification) {
        parts.push('File Modify');
      }
    } else {
      parts.push('Disabled');
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw terminal/computer icon
    ctx.fillStyle = this.color;
    ctx.fillRect(12, 12, 24, 18);
    ctx.fillStyle = '#000';
    ctx.fillRect(14, 14, 20, 14);

    // Draw terminal cursor
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(16, 20, 2, 6);

    // Draw shell status
    if (this.properties.enableShellExecution) {
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(20, 35, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = '#F44336';
      ctx.beginPath();
      ctx.moveTo(17, 33);
      ctx.lineTo(23, 39);
      ctx.moveTo(23, 33);
      ctx.lineTo(17, 39);
      ctx.stroke();
    }

    // Draw security indicators
    let yOffset = 45;

    if (this.properties.enableShellExecution) {
      const timeout = this.properties.timeoutSeconds as number;
      ctx.fillStyle = timeout <= 30 ? '#4CAF50' : timeout <= 60 ? '#FF9800' : '#F44336';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText(`${timeout}s timeout`, this.size[0] - 68, yOffset + 2);
      yOffset += 16;

      if (this.properties.allowFileModification) {
        ctx.fillStyle = '#F44336';
        ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.fillText('File Modify', this.size[0] - 68, yOffset + 2);
        yOffset += 16;
      }

      const allowedCount = (this.properties.allowedCommands as string[]).length;
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText(`${allowedCount} commands`, this.size[0] - 68, yOffset + 2);
    }

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}