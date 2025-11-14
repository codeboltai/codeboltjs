import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class ToFixedNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addOutput("out", "string");
    this.addProperty("precision", 0);
    this.size = [80, 30];
  }

  onExecute() {
    var a = this.getInputData(0);
    var result;
    
    if (a != null && a.constructor === Number) {
      result = a.toFixed(this.properties.precision);
    } else {
      result = a;
    }
    
    this.setOutputData(0, result);
  }
}

ToFixedNode.title = "to Fixed";
ToFixedNode.desc = "Format number with fixed decimals";

export default ToFixedNode;
