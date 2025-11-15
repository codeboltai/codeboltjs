import { BaseBypassNode } from '@agent-creator/shared-nodes';

export class BypassNode extends BaseBypassNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    const v = this.getInputData(0);
    this.setOutputData(0, v);
  }
}