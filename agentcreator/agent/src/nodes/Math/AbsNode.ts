import { BaseAbsNode } from '@agent-creator/shared-nodes';

export class AbsNode extends BaseAbsNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    const v = this.getInputData(0);
    this.setOutputData(0, this.calculateAbs(v));
  }
}