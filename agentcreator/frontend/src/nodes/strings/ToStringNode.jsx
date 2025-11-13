import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ToStringNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "");
    this.addOutput("out", "string");
    this.size = [80, 30];
  }

  onExecute() {
    var a = this.getInputData(0);
    var result;
    
    if (a && a.constructor === Object) {
      try {
        result = JSON.stringify(a);
      } catch {
        result = String(a);
      }
    } else {
      result = String(a);
    }
    
    this.setOutputData(0, result);
  }
}

ToStringNode.title = "to String";
ToStringNode.desc = "Convert to string";

export default ToStringNode;
