import { BaseSmoothStepNode } from '@agent-creator/shared-nodes';

export class SmoothStepNode extends BaseSmoothStepNode {
  constructor() {
    super();
    this.addInput("edge0", "number");
    this.addInput("edge1", "number");
    this.addInput("x", "number");
    this.addOutput("out", "number");
  }

  onExecute() {
    var edge0 = this.getInputData(0);
    var edge1 = this.getInputData(1);
    var x = this.getInputData(2);

    if (edge0 !== undefined) this.properties.edge0 = edge0;
    if (edge1 !== undefined) this.properties.edge1 = edge1;
    if (x !== undefined) this.properties.x = x;

    this.setOutputData(0, this.smoothStep(
      this.properties.edge0,
      this.properties.edge1,
      this.properties.x
    ));
  }
}