import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class SmoothStepNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
    this.properties = { A: 0, B: 1 };
  }

  onExecute() {
    var v = this.getInputData(0);
    if (v === undefined) {
      return;
    }

    var edge0 = this.properties.A;
    var edge1 = this.properties.B;

    // Scale, bias and saturate x to 0..1 range
    v = this.clamp((v - edge0) / (edge1 - edge0), 0.0, 1.0);
    // Evaluate polynomial
    v = v * v * (3 - 2 * v);

    this.setOutputData(0, v);
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}

SmoothStepNode.title = "Smoothstep";
SmoothStepNode.desc = "Smoothstep";

export default SmoothStepNode;
