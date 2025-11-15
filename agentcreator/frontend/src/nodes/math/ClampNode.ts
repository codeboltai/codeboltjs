import { BaseClampNode } from '@agent-creator/shared-nodes';

class ClampNode extends BaseClampNode {
  constructor() {
    super();
    this.addInput("in", "number");
    this.addOutput("out", "number");
  }

  onExecute() {
    const v = this.getInputData(0);
    if (v == null) {
      return;
    }
    const clampedValue = Math.max(this.properties.min, Math.min(this.properties.max, v));
    this.setOutputData(0, clampedValue);
  }
}

ClampNode.title = "Clamp";

export default ClampNode;
