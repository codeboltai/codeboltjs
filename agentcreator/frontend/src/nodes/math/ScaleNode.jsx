import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ScaleNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "number", { label: "" });
    this.addOutput("out", "number", { label: "" });
    this.size = [80, 30];
    this.addProperty("factor", 1);
  }

  onExecute() {
    var value = this.getInputData(0);
    if (value != null) {
      this.setOutputData(0, value * this.properties.factor);
    }
  }
}

ScaleNode.title = "Scale";
ScaleNode.desc = "v * factor";

export default ScaleNode;
