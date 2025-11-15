import { BaseRandNode } from '@agent-creator/shared-nodes';

export class RandNode extends BaseRandNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; i++) {
        const input = this.inputs[i];
        const v = this.getInputData(i);
        if (v !== undefined) {
          this.properties[input.name] = v;
        }
      }
    }

    this._last_v = this.generateRandom();
    this.setOutputData(0, this._last_v);
  }

  onGetInputs() {
    return [["min", "number"], ["max", "number"]];
  }
}