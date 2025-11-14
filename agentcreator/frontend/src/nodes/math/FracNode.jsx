import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class FracNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  onExecute() {
    var v = this.getInputData(0);
    if (v == null) {
      return;
    }
    this.setOutputData(0, v % 1);
  }
}

FracNode.title = "Frac";
FracNode.desc = "Returns fractional part";

export default FracNode;
