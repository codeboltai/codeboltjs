import { BaseSmoothStepNode } from '@agent-creator/shared-nodes';

class SmoothStepNode extends BaseSmoothStepNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.properties = { A: 0, B: 1 };
  }

  onExecute() {
    let v = this.getInputData(0);
    if (v === undefined) {
      return;
    }

    const edge0 = this.properties.A;
    const edge1 = this.properties.B;

    // Use the smoothstep method from base class
    this.setOutputData(0, this.smoothStep(edge0, edge1, v));
  }
}

SmoothStepNode.title = "Smoothstep";

export default SmoothStepNode;