import { BaseConcatenateNode } from '@agent-creator/shared-nodes';

// Backend-specific Concatenate Node - execution logic only
export class ConcatenateNode extends BaseConcatenateNode {
  onExecute() {
    const a = this.getInputData(0) as string;
    const b = this.getInputData(1) as string;
    const result = this.concatenateStrings(a, b);
    this.setOutputData(0, result);
    // console.log(`ConcatenateNode ${this.id}: "${a}" + "${b}" = "${result}"`);
  }
}