import { BaseLerpNode } from '@agent-creator/shared-nodes';

export class LerpNode extends BaseLerpNode {
  constructor() {
    super();
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("out", "number");
  }

  onExecute() {
    var v1 = this.getInputData(0);
    if (v1 == null) {
      v1 = 0;
    }
    var v2 = this.getInputData(1);
    if (v2 == null) {
      v2 = 0;
    }

    var f = this.properties.f;

    var _f = this.getInputData(2);
    if (_f !== undefined) {
      f = _f;
    }

    this.setOutputData(0, this.lerp(v1, v2, f));
  }

  onGetInputs() {
    return [["f", "number"]];
  }
}