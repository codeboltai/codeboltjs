import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class AndNode extends LGraphNode {
  constructor() {
    super();
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }

  onExecute() {
    var result = true;
    for (var inX in this.inputs) {
      if (!this.getInputData(inX)) {
        result = false;
        break;
      }
    }
    this.setOutputData(0, result);
  }

  onGetInputs() {
    return [
      ["and", "boolean"]
    ];
  }
}

AndNode.title = "AND";
AndNode.desc = "Return true if all inputs are true";

export default AndNode;
