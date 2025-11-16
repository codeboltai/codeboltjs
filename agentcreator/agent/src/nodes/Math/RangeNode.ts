import { BaseRangeNode } from '@agent-creator/shared-nodes';

export class RangeNode extends BaseRangeNode {
  constructor() {
    super();
    // Properties used by frontend
    (this as any)._last_v = 0;
  }

  // Backend execution logic
  onExecute() {
    // Update properties from inputs
    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; i++) {
        const input = this.inputs[i];
        const v = this.getInputData(i);
        if (v !== undefined) {
          (this.properties as any)[input.name] = v;
        }
      }
    }

    const inputValue = Number((this.properties as any).in) || 0;
    const in_min = Number((this.properties as any).in_min) || 0;
    const in_max = Number((this.properties as any).in_max) || 1;
    const out_min = Number((this.properties as any).out_min) || 0;
    const out_max = Number((this.properties as any).out_max) || 1;

    (this as any)._last_v = this.convertRange(inputValue, in_min, in_max, out_min, out_max);
    this.setOutputData(0, (this as any)._last_v);
    this.setOutputData(1, this.clamp((this as any)._last_v, out_min, out_max));
  }
}