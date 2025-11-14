import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class ClampNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
    this.addProperty("min", 0);
    this.addProperty("max", 1);
  }

  onExecute() {
    var v = this.getInputData(0);
    if (v == null) {
      return;
    }
    v = Math.max(this.properties.min, v);
    v = Math.min(this.properties.max, v);
    this.setOutputData(0, v);
  }
}

ClampNode.title = "Clamp";
ClampNode.desc = "Clamp number between min and max";

export default ClampNode;
