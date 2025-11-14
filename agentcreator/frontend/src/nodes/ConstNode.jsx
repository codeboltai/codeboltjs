import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class ConstNode extends LGraphNode {
    title = "Const";
    desc = "Outputs a constant value";
    
  constructor() {
    super();
    this.properties = { value: 1 };
    this.addOutput("", "number");
  }

  onExecute() {
    this.setOutputData(0, this.properties.value);
  }
}

ConstNode.title = "Const";
ConstNode.desc = "Outputs a constant value";

export default ConstNode;
