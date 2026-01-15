import { BaseTimeNode } from '@codebolt/agent-shared-nodes';
import { LGraphCanvas } from '@codebolt/litegraph';

// Frontend-specific Time Node - UI only
export class TimeNode extends BaseTimeNode {
  private widget: any;

  constructor() {
    super();
    // Frontend-specific UI setup
    this.widget = this.addWidget("text", "time", "0.000", "value", {});
    this.widgets_up = true;
  }

  // Frontend-specific title display
  getTitle(): string {
    if (this.flags.collapsed) {
      return "Time";
    }
    return this.title || "Time";
  }

  // Update widget value for display
  onExecute(): void {
    if (this.widget && this.graph) {
      const time = this.getCurrentTime?.(this.graph);
      if (time) {
        this.widget.value = `${time.seconds.toFixed(3)}s`;
      }
    }
  }

  // Custom foreground drawing for better visual feedback
  onDrawForeground(ctx: CanvasRenderingContext2D, _canvas: LGraphCanvas): void {
    if (this.flags.collapsed) return;

    // Display current time if graph is available
    if (this.graph) {
      const time = this.getCurrentTime?.(this.graph);
      if (time) {
        ctx.font = "10px Arial";
        ctx.fillStyle = "#666";
        ctx.fillText(`${time.milliseconds.toFixed(0)}ms`, 5, this.size[1] - 10);
        ctx.fillText(`${time.seconds.toFixed(3)}s`, 5, this.size[1] - 2);
      }
    }
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);
    // TimeNode doesn't have persistent properties to restore
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;
    // TimeNode doesn't have configurable properties
    return result;
  }
}