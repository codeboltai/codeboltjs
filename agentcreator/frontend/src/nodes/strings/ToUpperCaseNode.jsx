import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ToUpperCaseNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "string");
    this.addOutput("out", "string");
    this.size = [80, 30];
  }

  onExecute() {
    var a = this.getInputData(0);
    var result;
    
    if (a != null && a.constructor === String) {
      result = a.toUpperCase();
    } else {
      result = a;
    }
    
    this.setOutputData(0, result);
  }
}

ToUpperCaseNode.title = "to UpperCase";
ToUpperCaseNode.desc = "Convert string to uppercase";

export default ToUpperCaseNode;
