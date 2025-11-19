import { BaseToFixedNode } from '@codebolt/agent-shared-nodes';

// Backend-specific ToFixed Node - execution logic only
export class ToFixedNode extends BaseToFixedNode {
  onExecute() {
    const num = this.getInputData(0);
    const decimals = this.getInputData(1);
    const result = this.formatToFixed(num as number, decimals as number);
    this.setOutputData(0, result);
    // console.log(`ToFixedNode ${this.id}: ${num} to ${decimals} decimals = "${result}"`);
  }
}