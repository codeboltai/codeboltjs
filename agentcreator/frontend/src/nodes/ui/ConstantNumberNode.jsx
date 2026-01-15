import { BaseConstantNumberNode } from '@codebolt/agent-shared-nodes';

// Frontend-specific Constant Number Node - UI only
export class ConstantNumberNode extends BaseConstantNumberNode {
  constructor() {
    super();
    // Frontend-specific UI setup
    this.widget = this.addWidget("number", "value", this.properties.value, (value) => {
      this.setProperty("value", value);
    });
    this.widgets_up = true;
  }

  // Frontend display logic
  getTitle() {
    if (this.flags.collapsed) {
      return this.properties.value;
    }
    return this.title;
  }

  setValue(v) {
    this.setProperty("value", v);
  }

  onDrawBackground() {
    // Show the current value
    this.outputs[0].label = this.formatValue(this.properties.value);
  }

  // No execution logic in frontend
  onExecute() {
    // console.log(`ConstantNumberNode ${this.id} - UI only, execution handled by backend`);
  }

  // Handle property changes with UI updates
  setProperty(name, value) {
    super.setProperty(name, value);
    if (name === 'value' && this.widget) {
      this.widget.value = value;
    }
  }
}