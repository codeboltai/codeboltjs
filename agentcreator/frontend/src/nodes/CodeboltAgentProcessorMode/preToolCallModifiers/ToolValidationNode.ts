import { BaseToolValidationNode } from '@agent-creator/shared-nodes';

// Frontend Tool Validation Node - UI only
export class ToolValidationNode extends BaseToolValidationNode {
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
    const validationEnabled = this.properties.enableValidation as boolean;
    const strictMode = this.properties.strictValidation as boolean;
    const blockedCount = (this.properties.blockedToolTypes as string[]).length;

    // Change node color based on validation strictness
    if (validationEnabled && strictMode) {
      this.color = '#F44336'; // Red - strict validation
    } else if (validationEnabled && blockedCount > 0) {
      this.color = '#FF9800'; // Orange - moderate validation with blocks
    } else if (validationEnabled) {
      this.color = '#4CAF50'; // Green - basic validation
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

    if (this.properties.enableValidation) {
      if (this.properties.strictValidation) {
        parts.push('Strict');
      } else {
        parts.push('Standard');
      }

      if (this.properties.validateParameters) {
        parts.push('Params');
      }

      if (this.properties.validatePermissions) {
        parts.push('Perms');
      }

      if (this.properties.validateSchema) {
        parts.push('Schema');
      }

      const blockedCount = (this.properties.blockedToolTypes as string[]).length;
      if (blockedCount > 0) {
        parts.push(`${blockedCount} blocked`);
      }
    } else {
      parts.push('Disabled');
    }

    return parts.join(', ');
  }

  // Render custom visualization
  onDrawForeground(ctx: CanvasRenderingContext2D): void {
    // Draw validation checkmark/shield icon
    if (this.properties.enableValidation) {
      // Shield background
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.moveTo(22, 10);
      ctx.lineTo(35, 15);
      ctx.lineTo(35, 28);
      ctx.lineTo(22, 35);
      ctx.lineTo(9, 28);
      ctx.lineTo(9, 15);
      ctx.closePath();
      ctx.fill();

      // Checkmark
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 20);
      ctx.lineTo(19, 23);
      ctx.lineTo(26, 16);
      ctx.stroke();
    } else {
      // Disabled icon
      ctx.fillStyle = '#9E9E9E';
      ctx.fillRect(12, 12, 20, 20);
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(17, 17);
      ctx.lineTo(27, 27);
      ctx.moveTo(27, 17);
      ctx.lineTo(17, 27);
      ctx.stroke();
    }

    // Draw validation mode indicator
    if (this.properties.strictValidation) {
      ctx.fillStyle = '#F44336';
      ctx.fillRect(35, 18, 40, 8);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 7px Arial';
      ctx.fillText('STRICT', 38, 24);
    }

    // Draw feature indicators
    let yOffset = 45;

    if (this.properties.enableValidation) {
      if (this.properties.validateParameters) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.fillText('Parameters', this.size[0] - 68, yOffset + 2);
        yOffset += 16;
      }

      if (this.properties.validatePermissions) {
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.fillText('Permissions', this.size[0] - 68, yOffset + 2);
        yOffset += 16;
      }

      if (this.properties.validateSchema) {
        ctx.fillStyle = '#FF9800';
        ctx.fillRect(this.size[0] - 70, yOffset - 6, 60, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.fillText('Schema', this.size[0] - 68, yOffset + 2);
      }

      // Draw blocked tools count
      const blockedCount = (this.properties.blockedToolTypes as string[]).length;
      if (blockedCount > 0) {
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(this.size[0] - 20, 25, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(blockedCount.toString(), this.size[0] - 20, 28);
        ctx.textAlign = 'left';
      }
    }

    // Draw configuration summary
    const summary = this.getConfigurationSummary();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(summary, 10, this.size[1] - 5);
  }
}