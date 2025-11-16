import { BaseCompareNode } from '@agent-creator/shared-nodes';

// Backend-specific Compare Node - execution logic only
export class CompareNode extends BaseCompareNode {
  onExecute() {
    const a = this.getInputData(0);
    const b = this.getInputData(1);
    const caseSensitive = this.properties.case_sensitive;
    const result = this.compareStrings(a, b, caseSensitive);
    this.setOutputData(0, result);
    // console.log(`CompareNode ${this.id}: "${a}" == "${b}" (case: ${caseSensitive}) = ${result}`);
  }
}