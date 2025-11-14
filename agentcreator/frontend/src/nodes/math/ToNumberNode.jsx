import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class ToNumberNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in");
    this.addOutput("out");
  }

  onExecute() {
    var v = this.getInputData(0);
    this.setOutputData(0, Number(v));
  }
}

ToNumberNode.title = "to Number";
ToNumberNode.desc = "Cast to number";

export default ToNumberNode;
