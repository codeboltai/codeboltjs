import { BaseClampNode } from '@codebolt/agent-shared-nodes';

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
    const clampedValue = Math.max(Number(this.properties.min) || 0, Math.min(Number(this.properties.max) || 0, Number(v) || 0));
    this.setOutputData(0, clampedValue);
  }
}