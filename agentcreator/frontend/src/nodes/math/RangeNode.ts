import { BaseRangeNode } from '@agent-creator/shared-nodes';

class RangeNode extends BaseRangeNode {
  constructor() {
    super();
  }

  getTitle() {
    if (this.flags.collapsed) {
      return ((this as any)._last_v || 0).toFixed(2);
    }
    return this.title;
  }

  onDrawBackground() {
    //show the current value
    if ((this as any)._last_v) {
      this.outputs[0].label = (this as any)._last_v.toFixed(3);
    } else {
      this.outputs[0].label = "?";
    }
  }
}

RangeNode.title = "Range";

export default RangeNode;
