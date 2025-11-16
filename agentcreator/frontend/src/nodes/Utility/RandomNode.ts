import { BaseRandomNode } from '@agent-creator/shared-nodes';

// Frontend Random Node - UI only
export class RandomNode extends BaseRandomNode {
  private minWidget: any;
  private maxWidget: any;
  private seedWidget: any;
  private integerWidget: any;

  constructor() {
    super();
    // Frontend-specific widgets
    this.minWidget = this.addWidget("number", "min", this.properties.min, "min");
    this.maxWidget = this.addWidget("number", "max", this.properties.max, "max");
    this.seedWidget = this.addWidget("number", "seed", this.properties.seed, "seed");
    this.integerWidget = this.addWidget("toggle", "integer", this.properties.integer, "integer");

    this.widgets_up = true;
    this.size = [180, 120];
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);

    // Update widget values when properties change
    if (name === 'min' && this.minWidget) {
      this.minWidget.value = this.properties.min;
    } else if (name === 'max' && this.maxWidget) {
      this.maxWidget.value = this.properties.max;
    } else if (name === 'seed' && this.seedWidget) {
      this.seedWidget.value = this.properties.seed;
    } else if (name === 'integer' && this.integerWidget) {
      this.integerWidget.value = this.properties.integer;
    }

    return result;
  }

  // Frontend display
  onExecute() {
    if (this.graph) {
      const min = this.properties.min;
      const max = this.properties.max;
      const seed = this.properties.seed;
      const isInteger = this.properties.integer;

      const value = this.generateRandom(min, max, seed, isInteger);

      // Update a display widget if we want to show the current value
      if (this.minWidget && this.maxWidget) {
        // We could add a display widget here if needed
      }
    }
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure(info);

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
  onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (this.flags.collapsed) return;

    const min = this.properties.min;
    const max = this.properties.max;
    const isInteger = this.properties.integer;

    ctx.font = "9px Arial";
    ctx.fillStyle = "#666";

    const rangeText = isInteger
      ? `[${Math.floor(min)}-${Math.floor(max)}]`
      : `[${min.toFixed(2)}-${max.toFixed(2)}]`;

    ctx.fillText(rangeText, 5, this.size[1] - 5);

    if (isInteger) {
      ctx.fillStyle = "#9C27B0";
      ctx.fillText("INT", this.size[0] - 25, this.size[1] - 5);
    }
  }
}