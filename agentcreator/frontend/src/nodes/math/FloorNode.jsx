import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class FloorNode extends LGraphNode {
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
    this.setOutputData(0, Math.floor(v));
  }
}

FloorNode.title = "Floor";
FloorNode.desc = "Floor number to remove fractional part";

export default FloorNode;
