import { BaseSumNode } from '@codebolt/agent-shared-nodes';

// Frontend-specific SumNode - UI and interaction only
export class SumNode extends BaseSumNode {
  constructor() {
    super();
    // Frontend-specific UI setup
    this.addWidget("number", "precision", this.properties.precision, (value) => {
      this.setProperty("precision", parseInt(value) || 1);
    }, { min: 0, max: 10, step: 1 });
  }

  // // Frontend-specific methods
  // onDrawForeground(ctx, canvas) {
  //   if (this.flags.collapsed) return;

  //   // Display current values and result
  //   const a = this.getInputData(0) || 0;
  //   const b = this.getInputData(1) || 0;
  //   const sum = this.calculateSum(a, b);

  //   ctx.font = "11px Arial";
  //   ctx.fillStyle = "#888";
  //   ctx.fillText(`A: ${a}`, 10, 20);
  //   ctx.fillText(`B: ${b}`, 10, 35);
  //   ctx.fillText(`Sum: ${sum}`, 10, 50);
  // }

  // No execution logic in frontend - handled by backend
  onExecute() {
    // Empty - frontend doesn't execute
    // console.log(`SumNode ${this.id} - UI only, execution handled by backend`);
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