import { BaseScaleNode } from '@agent-creator/shared-nodes';

class ScaleNode extends BaseScaleNode {
  constructor() {
    super();
    this.addInput("in", "number", { label: "" });
    this.addOutput("out", "number", { label: "" });
  }

  onExecute() {
    const value = this.getInputData(0);
    if (value != null) {
      this.setOutputData(0, this.scale(value));
    }
  }
}

ScaleNode.title = "Scale";

export default ScaleNode;