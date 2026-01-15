import { BaseOrNode } from '@codebolt/agent-shared-nodes';

// Backend-specific OR Node - execution logic only
export class OrNode extends BaseOrNode {
  constructor() {
    super();
  }

  onExecute() {
    const inputData: any = {};
    for (let i = 0; i < this.inputs.length; i++) {
      inputData[i] = this.getInputData(i);
    }
    const result = this.performLogicalOr(inputData);
    this.setOutputData(0, result);
    // console.log(`OrNode ${this.id}: ${JSON.stringify(inputData)} = ${result}`);
  }

  // Support dynamic inputs
  onGetInputs(): string[][] {
    return this.getDynamicInputs();
  }
}