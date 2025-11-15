import { BaseClampNode } from '@agent-creator/shared-nodes';

export class ClampNode extends BaseClampNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    const v = this.getInputData(0);
    if (v == null) {
      return;
    }
    const clampedValue = Math.max(this.properties.min, Math.min(this.properties.max, v));
    this.setOutputData(0, clampedValue);
  }
}