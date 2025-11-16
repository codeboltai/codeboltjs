import { BaseRandNode } from '@agent-creator/shared-nodes';

export class RandNode extends BaseRandNode {
  constructor() {
    super();
    // Properties used by frontend
    (this as any)._last_v = 0;
  }

  // Backend execution logic
  onExecute() {
    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; i++) {
        const input = this.inputs[i];
        const incoming = this.getInputData(i);
        if (incoming !== undefined) {
          const numericValue = typeof incoming === 'number'
            ? incoming
            : parseFloat(String(incoming));
          if (!Number.isNaN(numericValue)) {
            this.properties[input.name] = numericValue;
          }
        }
      }
    }

    (this as any)._last_v = this.generateRandom();
    this.setOutputData(0, (this as any)._last_v);
  }

  onGetInputs() {
    return [["min", "number"], ["max", "number"]];
  }
}