import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class BypassNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in");
    this.addOutput("out");
    this.size = [80, 30];
  }

  onExecute() {
    var v = this.getInputData(0);
    this.setOutputData(0, v);
  }
}

BypassNode.title = "Bypass";
BypassNode.desc = "removes the type";

export default BypassNode;
