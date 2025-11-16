import { BaseToUpperCaseNode } from '@agent-creator/shared-nodes';

// Backend-specific ToUpperCase Node - execution logic only
export class ToUpperCaseNode extends BaseToUpperCaseNode {
  onExecute() {
    const value = this.getInputData(0);
    const result = this.toUpperCase(value);
    this.setOutputData(0, result);
    // console.log(`ToUpperCaseNode ${this.id}: "${value}" -> "${result}"`);
  }
}