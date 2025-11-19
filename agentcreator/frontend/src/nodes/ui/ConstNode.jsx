import { BaseConstNode } from '@codebolt/agent-shared-nodes';

// Frontend-specific ConstNode - UI and interaction only
export class ConstNode extends BaseConstNode {
  constructor() {
    super();
    // Frontend-specific UI setup
    this.addWidget("number", "value", this.properties.value, (value) => {
      this.setProperty("value", value);
    }, { min: 0, step: 1 });
  }

  // // Frontend-specific methods
  // onDrawForeground(ctx, canvas) {
  //   if (this.flags.collapsed) return;

  //   // Draw custom UI elements if needed
  //   ctx.font = "12px Arial";
  //   ctx.fillStyle = "#888";
  //   ctx.fillText(`Value: ${this.properties.value}`, 10, 25);
  // }

  // No execution logic in frontend - handled by backend
  onExecute() {
    // Empty - frontend doesn't execute
    // console.log(`ConstNode ${this.id} - UI only, execution handled by backend`);
  }

  // Handle property changes with UI updates
  setProperty(name, value) {
    super.setProperty(name, value);
    // Update widget if exists
    const widget = this.widgets?.find(w => w.name === name);
    if (widget) {
      widget.value = value;
    }
  }
}