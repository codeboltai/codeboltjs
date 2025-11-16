import { BaseOrNode } from '@agent-creator/shared-nodes';

// Frontend OR Node - UI only
export class OrNode extends BaseOrNode {
  constructor() {
    super();
    // Add UI control for adding more inputs
    this.addWidget("button", "Add Input", undefined, () => {
      this.addInput(`or${this.inputs.length}`, "boolean");
    });
  }

  onExecute() {
    // console.log(`OrNode ${this.id} - UI only, execution handled by backend`);
  }

  // Support dynamic inputs
  onGetInputs(): string[][] {
    return this.getDynamicInputs();
  }
}
