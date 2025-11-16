import { BaseLerpNode } from '@agent-creator/shared-nodes';

export class LerpNode extends BaseLerpNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    const v1 = this.getInputData(0);
    const v2 = this.getInputData(1);
    let f = (this.properties as any).f;

    const _f = this.getInputData(2);
    if (_f !== undefined) {
      (this.properties as any).f = _f;
      f = _f;
    }

    this.setOutputData(0, this.lerp(Number(v1) || 0, Number(v2) || 0, Number(f) || 0));
  }

  onGetInputs() {
    return [["f", "number"]];
  }
}