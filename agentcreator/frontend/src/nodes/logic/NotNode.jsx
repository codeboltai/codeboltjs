import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class NotNode extends LGraphNode {
  constructor() {
    super();
    this.properties = {};
    this.addInput("in", "boolean");
    this.addOutput("out", "boolean");
  }

  onExecute() {
    var ret = !this.getInputData(0);
    this.setOutputData(0, ret);
  }
}

NotNode.title = "NOT";
NotNode.desc = "Return the logical negation";

export default NotNode;
