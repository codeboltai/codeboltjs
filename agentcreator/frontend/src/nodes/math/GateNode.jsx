import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class GateNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("v", "boolean");
    this.addInput("A");
    this.addInput("B");
    this.addOutput("out");
    this.size = [80, 60];
  }

  onExecute() {
    var v = this.getInputData(0);
    this.setOutputData(0, this.getInputData(v ? 1 : 2));
  }
}

GateNode.title = "Gate";
GateNode.desc = "if v is true, then outputs A, otherwise B";

export default GateNode;
