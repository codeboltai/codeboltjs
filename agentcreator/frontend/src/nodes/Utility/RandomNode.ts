import { BaseRandomNode } from '@codebolt/agent-shared-nodes';
import { LGraphCanvas } from '@codebolt/litegraph';

// Frontend Random Node - UI only
export class RandomNode extends BaseRandomNode {
  private minWidget: any;
  private maxWidget: any;
  private seedWidget: any;
  private integerWidget: any;

  constructor() {
    super();
    // Frontend-specific widgets
    this.minWidget = this.addWidget("number", "min", this.properties.min as number, "min");
    this.maxWidget = this.addWidget("number", "max", this.properties.max as number, "max");
    this.seedWidget = this.addWidget("number", "seed", this.properties.seed as number, "seed");
    this.integerWidget = this.addWidget("toggle", "integer", this.properties.integer as boolean, "integer");

    this.widgets_up = true;
    this.size = [180, 120];
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update widget values when properties change
    if (name === 'min' && this.minWidget) {
      this.minWidget.value = this.properties.min as number;
    } else if (name === 'max' && this.maxWidget) {
      this.maxWidget.value = this.properties.max as number;
    } else if (name === 'seed' && this.seedWidget) {
      this.seedWidget.value = this.properties.seed as number;
    } else if (name === 'integer' && this.integerWidget) {
      this.integerWidget.value = this.properties.integer as boolean;
    }

    return result;
  }

  // Frontend display
  onExecute(): void {
    if (this.graph) {
      const min = this.properties.min as number;
      const max = this.properties.max as number;
      const seed = this.properties.seed as number;
      const isInteger = this.properties.integer as boolean;

      // Generate random value
      this.generateRandom?.(min, max, seed, isInteger);
    }
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget values from properties
    if (this.minWidget) {
      this.minWidget.value = this.properties.min || 0;
    }
    if (this.maxWidget) {
      this.maxWidget.value = this.properties.max || 1;
    }
    if (this.seedWidget) {
      this.seedWidget.value = this.properties.seed;
    }
    if (this.integerWidget) {
      this.integerWidget.value = this.properties.integer !== undefined ? this.properties.integer : false;
    }
  }

  // Visual feedback for range
  onDrawForeground(ctx: CanvasRenderingContext2D, _canvas: LGraphCanvas): void {
    if (this.flags.collapsed) return;

    const min = this.properties.min as number;
    const max = this.properties.max as number;
    const isInteger = this.properties.integer as boolean;

    ctx.font = "9px Arial";
    ctx.fillStyle = "#666";

    const rangeText = isInteger
      ? `[${Math.floor(min)}-${Math.floor(max)}]`
      : `[${(min as number).toFixed(2)}-${(max as number).toFixed(2)}]`;

    ctx.fillText(rangeText, 5, this.size[1] - 5);

    if (isInteger) {
      ctx.fillStyle = "#9C27B0";
      ctx.fillText("INT", this.size[0] - 25, this.size[1] - 5);
    }
  }
}