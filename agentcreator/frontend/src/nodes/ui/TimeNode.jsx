import { BaseTimeNode } from '@agent-creator/shared-nodes';

// Frontend-specific Time Node - UI only
export class TimeNode extends BaseTimeNode {
  constructor() {
    super();
    // Frontend-specific UI setup
    this.addWidget("text", "time", "0.000", "value", { disabled: true });
    this.widgets_up = true;
  }

  // Frontend display
  onExecute() {
    // Empty - frontend doesn't execute
    // console.log(`TimeNode ${this.id} - UI only, execution handled by backend`);
  }

  onDrawForeground(ctx, canvas) {
    if (this.flags.collapsed) return;

    // Display current time
    if (this.graph) {
      const time = this.getCurrentTime(this.graph);
      ctx.font = "11px Arial";
      ctx.fillStyle = "#888";
      ctx.fillText(`${time.milliseconds.toFixed(0)}ms`, 10, 20);
      ctx.fillText(`${time.seconds.toFixed(2)}s`, 10, 35);
    }
  }
}