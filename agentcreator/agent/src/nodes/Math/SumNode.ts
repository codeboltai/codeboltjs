import { BaseSumNode } from '@agent-creator/shared-nodes';

export class SumNode extends BaseSumNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    const A = this.getInputData(0) || 0;
    const B = this.getInputData(1) || 0;
    this.setOutputData(0, this.calculateSum(A, B));
  }
}