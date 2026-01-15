import { LiteGraph } from '@codebolt/litegraph';
import { BaseOperationNode } from '@codebolt/agent-shared-nodes';

class OperationNode extends BaseOperationNode {
  constructor() {
    super();
  }

  onDrawBackground(ctx) {
    if (this.flags.collapsed) {
      return;
    }

    ctx.font = "40px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText(
      this.properties.OP,
      this.size[0] * 0.5,
      (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5
    );
    ctx.textAlign = "left";
  }
}

OperationNode.title = "Operation";

export default OperationNode;