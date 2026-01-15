import { LiteGraph } from '@codebolt/litegraph';
import { BaseOperationNode } from '@codebolt/agent-shared-nodes';

export class OperationNode extends BaseOperationNode {
  constructor() {
    super();
  }

  // Backend execution logic - override base if needed
  onExecute() {
    let A = this.getInputData(0);
    let B = this.getInputData(1);
    let finalA = A;
    let finalB = B;

    if (A != null) {
      if (A.constructor === Number)
        (this.properties as any)["A"] = A;
    } else {
      finalA = (this.properties as any)["A"];
    }

    if (B != null) {
      (this.properties as any)["B"] = B;
    } else {
      finalB = (this.properties as any)["B"];
    }

    const result = this.performOperation(finalA, finalB, (this.properties as any).OP);
    this.setOutputData(0, result);
  }

  onDrawBackground(ctx) {
    if (this.flags.collapsed) {
      return;
    }

    ctx.font = "40px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText(
      (this.properties as any).OP,
      this.size[0] * 0.5,
      (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5
    );
    ctx.textAlign = "left";
  }
}