import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ContainsNode extends LGraphNode {
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
    var result = false;
    
    if (a !== undefined && b !== undefined) {
      result = a.indexOf(b) != -1;
    }
    
    this.setOutputData(0, result);
  }
}

ContainsNode.title = "Contains";
ContainsNode.desc = "Check if string contains substring";

export default ContainsNode;
