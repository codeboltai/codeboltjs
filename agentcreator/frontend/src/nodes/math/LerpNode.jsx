import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class LerpNode extends LGraphNode {
  constructor() {
    super();
    this.properties = { f: 0.5 };
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("out", "number");
    this.size = [80, 60];
  }

  onExecute() {
    var v1 = this.getInputData(0);
    if (v1 == null) {
      v1 = 0;
    }
    var v2 = this.getInputData(1);
    if (v2 == null) {
      v2 = 0;
    }

    var f = this.properties.f;

    var _f = this.getInputData(2);
    if (_f !== undefined) {
      f = _f;
    }

    this.setOutputData(0, v1 * (1 - f) + v2 * f);
  }

  onGetInputs() {
    return [["f", "number"]];
  }
}

LerpNode.title = "Lerp";
LerpNode.desc = "Linear Interpolation";

export default LerpNode;
