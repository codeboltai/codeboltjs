import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class CompareNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("a", "string");
    this.addInput("b", "string");
    this.addOutput("out", "boolean");
    this.size = [80, 30];
  }

  onExecute() {
    var a = this.getInputData(0);
    var b = this.getInputData(1);
    var result = a == b;
    this.setOutputData(0, result);
  }
}

CompareNode.title = "Compare";
CompareNode.desc = "Compare two strings";

export default CompareNode;
