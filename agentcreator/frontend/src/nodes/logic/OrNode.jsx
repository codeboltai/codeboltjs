import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class OrNode extends LGraphNode {
  constructor() {
    super();
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }

  onExecute() {
    var ret = false;
    for (var inX in this.inputs) {
      if (this.getInputData(inX)) {
        ret = true;
        break;
      }
    }
    this.setOutputData(0, ret);
  }

  onGetInputs() {
    return [
      ["or", "boolean"]
    ];
  }
}

OrNode.title = "OR";
OrNode.desc = "Return true if at least one input is true";

export default OrNode;
