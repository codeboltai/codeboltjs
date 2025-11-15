import { BaseRangeNode } from '@agent-creator/shared-nodes';

export class RangeNode extends BaseRangeNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    // Update properties from inputs
    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; i++) {
        const input = this.inputs[i];
        const v = this.getInputData(i);
        if (v !== undefined) {
          this.properties[input.name] = v;
        }
      }
    }

    const inputValue = this.properties.in || 0;
    const in_min = this.properties.in_min || 0;
    const in_max = this.properties.in_max || 1;
    const out_min = this.properties.out_min || 0;
    const out_max = this.properties.out_max || 1;

    this._last_v = this.convertRange(inputValue, in_min, in_max, out_min, out_max);
    this.setOutputData(0, this._last_v);
    this.setOutputData(1, this.clamp(this._last_v, out_min, out_max));
  }
}