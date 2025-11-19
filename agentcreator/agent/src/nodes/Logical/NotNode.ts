import { BaseNotNode } from '@codebolt/agent-shared-nodes';

// Backend-specific NOT Node - execution logic only
export class NotNode extends BaseNotNode {
  constructor() {
    super();
  }

  onExecute() {
    const value = this.getInputData(0);
    const result = this.performNot(value);
    this.setOutputData(0, result);
    // console.log(`NotNode ${this.id}: !${value} = ${result}`);
  }
}