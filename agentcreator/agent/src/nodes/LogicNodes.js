import { BaseOrNode, BaseNotNode, BaseSelectorNode } from '@agent-creator/shared-nodes';

// Backend-specific OR Node - execution logic only
export class OrNode extends BaseOrNode {
  onExecute() {
    const inputData = {};
    for (let i = 0; i < this.inputs.length; i++) {
      inputData[i] = this.getInputData(i);
    }
    const result = this.performLogicalOr(inputData);
    this.setOutputData(0, result);
    // console.log(`OrNode ${this.id}: ${JSON.stringify(inputData)} = ${result}`);
  }

  // Support dynamic inputs
  onGetInputs() {
    return this.getDynamicInputs();
  }
}

// Backend-specific NOT Node - execution logic only
export class NotNode extends BaseNotNode {
  onExecute() {
    const value = this.getInputData(0);
    const result = this.performNot(value);
    this.setOutputData(0, result);
    // console.log(`NotNode ${this.id}: !${value} = ${result}`);
  }
}

// Backend-specific Selector Node - execution logic only
export class SelectorNode extends BaseSelectorNode {
  onExecute() {
    const selector = this.getInputData(0);
    const inputs = [];

    // Collect all input values starting from index 1
    for (let i = 1; i < this.inputs.length; i++) {
      inputs.push(this.getInputData(i));
    }

    const selected = this.selectInput(inputs, selector);
    this.setOutputData(0, selected);
    // console.log(`SelectorNode ${this.id}: selected index ${selector} = ${selected}`);
  }
}