import { BaseScaleNode } from '@agent-creator/shared-nodes';

export class ScaleNode extends BaseScaleNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addInput("factor", "number");
    this.addOutput("out", "number");
  }

  onExecute() {
    var value = this.getInputData(0);
    var factor = this.getInputData(1);

    this.setOutputData(0, this.scale(value, factor));
  }
}