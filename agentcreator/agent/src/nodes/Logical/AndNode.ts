import { BaseAndNode } from '@codebolt/agent-shared-nodes';

// Backend-specific AND Node - execution logic only
export class AndNode extends BaseAndNode {
  constructor() {
    super();
  }

  onExecute() {
    const inputData: any = {};
    for (let i = 0; i < this.inputs.length; i++) {
      inputData[i] = this.getInputData(i);
    }
    const result = this.performLogicalAnd(inputData);
    this.setOutputData(0, result);
    // console.log(`AndNode ${this.id}: ${JSON.stringify(inputData)} = ${result}`);
  }

  // Support dynamic inputs
  onGetInputs(): string[][] {
    return this.getDynamicInputs();
  }
}