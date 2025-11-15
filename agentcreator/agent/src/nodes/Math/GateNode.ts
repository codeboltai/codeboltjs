import { BaseGateNode } from '@agent-creator/shared-nodes';

export class GateNode extends BaseGateNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addInput("open", "boolean");
    this.addOutput("out", "number");
  }

  onExecute() {
    var value = this.getInputData(0);
    var open = this.getInputData(1);

    this.setOutputData(0, this.gate(value, open));
  }
}