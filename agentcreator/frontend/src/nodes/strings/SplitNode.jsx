import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class SplitNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("str", "string,array");
    this.addInput("separator", "string");
    this.addOutput("out", "array");
    this.addProperty("separator", ",");
    this.size = [120, 30];
  }

  onExecute() {
    var str = this.getInputData(0);
    var separator = this.getInputData(1);
    
    if (separator == null) {
      separator = this.properties.separator;
    }
    
    if (str == null) {
      this.setOutputData(0, []);
      return;
    }
    
    var result;
    
    if (str.constructor === String) {
      result = str.split(separator || " ");
    } else if (str.constructor === Array) {
      result = [];
      for (var i = 0; i < str.length; ++i) {
        if (typeof str[i] == "string") {
          result[i] = str[i].split(separator || " ");
        }
      }
    } else {
      result = null;
    }
    
    this.setOutputData(0, result);
  }
}

SplitNode.title = "Split";
SplitNode.desc = "Split string by separator";

export default SplitNode;
