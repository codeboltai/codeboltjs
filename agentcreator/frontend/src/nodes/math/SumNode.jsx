import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class SumNode extends LGraphNode {
    title = "Sum";
    desc = "Adds two numbers";
    
  constructor() {
    super();
    this.properties = { precision: 1 };
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("A+B", "number");
  }

  onExecute() {
    const A = this.getInputData(0) || 0;
    const B = this.getInputData(1) || 0;
    this.setOutputData(0, A + B);
  }
}

SumNode.title = "Sum";
SumNode.desc = "Adds two numbers";

export default SumNode;
