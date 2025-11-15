import { BaseGateNode } from '@agent-creator/shared-nodes';

class GateNode extends BaseGateNode {
  constructor() {
    super();
    this.addInput("v", "boolean");
    this.addInput("A");
    this.addInput("B");
    this.addOutput("out");
  }

  onExecute() {
    const v = this.getInputData(0);
    this.setOutputData(0, this.gate(this.getInputData(v ? 1 : 2), v));
  }
}

GateNode.title = "Gate";

export default GateNode;