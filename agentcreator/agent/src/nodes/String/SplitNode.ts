import { BaseSplitNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Split Node - execution logic only
export class SplitNode extends BaseSplitNode {
  onExecute() {
    const str = this.getInputData(0);
    const delimiter = this.getInputData(1);
    const result = this.splitString(str as string, delimiter as string);
    this.setOutputData(0, result);
    // console.log(`SplitNode ${this.id}: "${str}" by "${delimiter}" =`, result);
  }
}