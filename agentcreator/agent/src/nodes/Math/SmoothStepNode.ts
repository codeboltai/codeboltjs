import { BaseSmoothStepNode } from '@codebolt/agent-shared-nodes';

export class SmoothStepNode extends BaseSmoothStepNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    let edge0 = this.getInputData(0);
    let edge1 = this.getInputData(1);
    let x = this.getInputData(2);

    if (edge0 !== undefined) (this.properties as any).edge0 = edge0;
    if (edge1 !== undefined) (this.properties as any).edge1 = edge1;
    if (x !== undefined) (this.properties as any).x = x;

    this.setOutputData(0, this.smoothStep(
      Number((this.properties as any).edge0) || 0,
      Number((this.properties as any).edge1) || 1,
      Number((this.properties as any).x) || 0
    ));
  }
}