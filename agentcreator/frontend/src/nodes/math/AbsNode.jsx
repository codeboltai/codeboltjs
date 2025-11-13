import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class AbsNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  onExecute() {
    var v = this.getInputData(0);
    if (v == null) {
      return;
    }
    this.setOutputData(0, Math.abs(v));
  }
}

AbsNode.title = "Abs";
AbsNode.desc = "Absolute";

export default AbsNode;
