import { BaseAndNode } from '@agent-creator/shared-nodes';

// Frontend AND Node - UI only
export class AndNode extends BaseAndNode {
  constructor() {
    super();
    // Add UI control for adding more inputs
    this.addWidget("button", "Add Input", null, () => {
      this.addInput(`and${this.inputs.length}`, "boolean");
    });
  }

  onExecute() {
    // console.log(`AndNode ${this.id} - UI only, execution handled by backend`);
  }

  // Support dynamic inputs
  onGetInputs() {
    return this.getDynamicInputs();
  }
}
