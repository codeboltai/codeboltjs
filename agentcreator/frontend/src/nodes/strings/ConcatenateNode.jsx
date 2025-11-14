import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class ConcatenateNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("a", "string");
    this.addInput("b", "string");
    this.addOutput("out", "string");
    this.size = [80, 30];
  }

  onExecute() {
    var a = this.getInputData(0);
    var b = this.getInputData(1);
    var result;
    
    if (a === undefined) {
      result = b;
    } else if (b === undefined) {
      result = a;
    } else {
      result = a + b;
    }
    
    this.setOutputData(0, result);
  }
}

ConcatenateNode.title = "Concatenate";
ConcatenateNode.desc = "Join two strings";

export default ConcatenateNode;
