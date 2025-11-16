import { BaseStringToTableNode } from '@agent-creator/shared-nodes';

// Backend-specific String to Table Node - execution logic only
export class StringToTableNode extends BaseStringToTableNode {
  onExecute() {
    const str = this.getInputData(0);
    const delimiter = this.getInputData(1);
    const result = this.convertStringToTable(str, delimiter);
    this.setOutputData(0, result);
    // console.log(`StringToTableNode ${this.id}: "${str}" by "${delimiter}" =`, result);
  }
}