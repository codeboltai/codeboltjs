import { BaseToStringNode } from '@agent-creator/shared-nodes';

// Backend-specific ToString Node - execution logic only
export class ToStringNode extends BaseToStringNode {
  onExecute() {
    const value = this.getInputData(0);
    const result = this.convertToString(value);
    this.setOutputData(0, result);
    // console.log(`ToStringNode ${this.id}: ${value} -> "${result}"`);
  }
}