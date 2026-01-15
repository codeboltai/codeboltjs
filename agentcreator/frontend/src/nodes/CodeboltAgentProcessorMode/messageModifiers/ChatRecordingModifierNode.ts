import { BaseChatRecordingModifierNode } from '@codebolt/agent-shared-nodes';

// Frontend Chat Recording Modifier Node - UI only
export class ChatRecordingModifierNode extends BaseChatRecordingModifierNode {
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
    const recordingEnabled = this.properties.enableRecording as boolean;
    const format = this.properties.recordingFormat as string;
    const autoRotate = this.properties.autoRotateFiles as boolean;

    // Change node color based on recording status and features
    if (!recordingEnabled) {
      this.color = '#9E9E9E'; // Gray - disabled
    } else if (autoRotate) {
      this.color = '#4CAF50'; // Green - advanced features
    } else if (format === 'json' || format === 'markdown') {
      this.color = '#2196F3'; // Blue - special format
    } else {
      this.color = '#FF9800'; // Orange - basic recording
    }

    // Mark canvas as dirty to trigger redraw
    if (this.graph) {
      this.graph.setDirtyCanvas(true, true);
    }
  }

  // Get human-readable configuration summary
  getConfigurationSummary(): string {
    const parts: string[] = [];

    if (this.properties.enableRecording) {
      const format = this.properties.recordingFormat as string;
      parts.push(format.toUpperCase());

      const maxSize = this.properties.maxRecordingSize as number;
      parts.push(`${(maxSize / 1024 / 1024).toFixed(0)}MB`);

      if (this.properties.autoRotateFiles) {
        parts.push('Auto-rotate');
      }

      if (this.properties.compressionEnabled) {
        parts.push('Compressed');
      }
    } else {
      parts.push('Disabled');
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw recording icon (disk/tape)
    ctx.fillStyle = this.color as string;
    ctx.beginPath();
    ctx.arc(20, 20, 12, 0, 2 * Math.PI);
    ctx.fill();

    // Center hole
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(20, 20, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Recording indicator (red dot)
    if (this.properties.enableRecording) {
      ctx.fillStyle = '#F44336';
      ctx.beginPath();
      ctx.arc(20, 35, 3, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = '#666';
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(17, 32);
      ctx.lineTo(23, 38);
      ctx.moveTo(23, 32);
      ctx.lineTo(17, 38);
      ctx.stroke();
    }

    // Draw format indicator
    const format = this.properties.recordingFormat as string;
    let formatColor = '#666';

    switch (format) {
      case 'json':
        formatColor = '#4CAF50';
        break;
      case 'markdown':
        formatColor = '#2196F3';
        break;
      case 'jsonl':
        formatColor = '#FF9800';
        break;
    }

    ctx.fillStyle = formatColor;
    ctx.fillRect(35, 16, 50, 8);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px Arial';
    ctx.fillText(format.toUpperCase(), 40, 22);

    // Draw feature indicators
    let yOffset = 45;

    if (this.properties.enableRecording) {
      if (this.properties.autoRotateFiles) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.fillText('Auto-Rotate', this.size[0] - 68, yOffset + 2);
        yOffset += 16;
      }

      if (this.properties.compressionEnabled) {
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.fillText('Compressed', this.size[0] - 68, yOffset + 2);
        yOffset += 16;
      }

      // Draw size indicator
      const maxSize = this.properties.maxRecordingSize as number;
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
      ctx.fillStyle = '#FFF';
      ctx.font = '9px Arial';
      ctx.fillText(`${(maxSize / 1024 / 1024).toFixed(0)}MB`, this.size[0] - 68, yOffset + 2);
    }

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}