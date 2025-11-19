import { BaseSelectorNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Selector Node - execution logic only
export class SelectorNode extends BaseSelectorNode {
  constructor() {
    super();
  }

  onExecute() {
    const selector = this.getInputData(0) as number;
    const inputs: any[] = [];

    // Collect all input values starting from index 1
    for (let i = 1; i < this.inputs.length; i++) {
      inputs.push(this.getInputData(i));
    }

    const selected = this.selectInput(inputs, selector);
    this.setOutputData(0, selected);
    // console.log(`SelectorNode ${this.id}: selected index ${selector} = ${selected}`);
  }
}