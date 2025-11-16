import { BaseDelayNode } from '@agent-creator/shared-nodes';
import { LiteGraph } from '@codebolt/litegraph';

// Frontend Delay Node - UI only
export class DelayNode extends BaseDelayNode {
  private delayWidget: any;
  private asyncWidget: any;
  private statusWidget: any;

  constructor() {
    super();
    // Frontend-specific widgets
    this.delayWidget = this.addWidget("number", "delay (ms)", this.properties.delay, "delay", { min: 0, max: 60000 });
    this.asyncWidget = this.addWidget("toggle", "async", this.properties.async, "async");
    this.statusWidget = this.addWidget("text", "status", "ready", "status", { disabled: true });

    this.widgets_up = true;
    this.size = [160, 120];

    this.status = "ready";
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);

    // Update widget values when properties change
    if (name === 'delay' && this.delayWidget) {
      this.delayWidget.value = this.properties.delay;
    } else if (name === 'async' && this.asyncWidget) {
      this.asyncWidget.value = this.properties.async;
    }

    return result;
  }

  // Frontend display
  onExecute() {
    // Update status widget
    if (this.statusWidget) {
      const delay = this.properties.delay;
      this.statusWidget.value = `ready (${delay}ms)`;
    }
  }

  // Action input handler
  onAction() {
    if (this.statusWidget) {
      this.statusWidget.value = "triggered...";
    }
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure(info);

    // Restore widget values from properties
    if (this.delayWidget) {
      this.delayWidget.value = this.properties.delay || 1000;
    }
    if (this.asyncWidget) {
      this.asyncWidget.value = this.properties.async !== undefined ? this.properties.async : true;
    }
    if (this.statusWidget) {
      this.statusWidget.value = "ready";
    }
  }

  // Visual feedback for delay status
  onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (this.flags.collapsed) return;

    const delay = this.properties.delay;
    const isAsync = this.properties.async;

    ctx.font = "9px Arial";
    ctx.fillStyle = "#666";

    ctx.fillText(`${delay}ms`, 5, this.size[1] - 12);

    if (isAsync) {
      ctx.fillStyle = "#FF5722";
      ctx.fillText("ASYNC", 5, this.size[1] - 2);
    } else {
      ctx.fillStyle = "#888";
      ctx.fillText("SYNC", 5, this.size[1] - 2);
    }
  }

  // Additional input for external delay control
  onGetInputs() {
    return [
      ["reset", LiteGraph.ACTION],
      ...this.inputs.slice(2) // Keep existing inputs
    ];
  }

  // Handle reset action
  onActionReset() {
    if (this.statusWidget) {
      this.statusWidget.value = "reset";
    }
    // Cancel any ongoing delays if this were a real implementation
  }
}