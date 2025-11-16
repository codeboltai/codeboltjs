import { BaseTimeNode } from '@agent-creator/shared-nodes';

// Frontend-specific Time Node - UI only
export class TimeNode extends BaseTimeNode {
  private widget: any;

  constructor() {
    super();
    // Frontend-specific UI setup
    this.widget = this.addWidget("text", "time", "0.000", "value", { disabled: true });
    this.widgets_up = true;
  }

  // Frontend-specific title display
  getTitle() {
    if (this.flags.collapsed) {
      return "Time";
    }
    return this.title;
  }

  // Update widget value for display
  onExecute() {
    if (this.widget && this.graph) {
      const time = this.getCurrentTime(this.graph);
      this.widget.value = `${time.seconds.toFixed(3)}s`;
    }
  }

  // Custom foreground drawing for better visual feedback
  onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (this.flags.collapsed) return;

    // Display current time if graph is available
    if (this.graph) {
      const time = this.getCurrentTime(this.graph);
      ctx.font = "10px Arial";
      ctx.fillStyle = "#666";
      ctx.fillText(`${time.milliseconds.toFixed(0)}ms`, 5, this.size[1] - 10);
      ctx.fillText(`${time.seconds.toFixed(3)}s`, 5, this.size[1] - 2);
    }
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure(info);
    // TimeNode doesn't have persistent properties to restore
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);
    // TimeNode doesn't have configurable properties
    return result;
  }
}