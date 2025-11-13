import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class BranchNode extends LGraphNode {
  constructor() {
    super();
    this.properties = {};
    this.addInput("onTrigger", LiteGraph.ACTION);
    this.addInput("condition", "boolean");
    this.addOutput("true", LiteGraph.EVENT);
    this.addOutput("false", LiteGraph.EVENT);
    this.mode = LiteGraph.ON_TRIGGER;
    this.size = [120, 60];
  }

  onExecute() {
    var condition = this.getInputData(1);
    if (condition) {
      this.triggerSlot(0);
    } else {
      this.triggerSlot(1);
    }
  }
}

BranchNode.title = "Branch";
BranchNode.desc = "Branch execution on condition";

export default BranchNode;
