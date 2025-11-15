import { BaseToNumberNode } from '@agent-creator/shared-nodes';

export class ToNumberNode extends BaseToNumberNode {
  constructor() {
    super();
    this.addInput("in", 0);
    this.addOutput("out", 0);
  }

  // Backend execution logic
  onExecute() {
    const v = this.getInputData(0);
    this.setOutputData(0, Number(v));
  }
}