import { BaseRandNode } from '@codebolt/agent-shared-nodes';

class RandNode extends BaseRandNode {
  constructor() {
    super();
  }

  onDrawBackground() {
    //show the current value
    this.outputs[0].label = ((this as any)._last_v || 0).toFixed(3);
  }
}

RandNode.title = "Rand";

export default RandNode;