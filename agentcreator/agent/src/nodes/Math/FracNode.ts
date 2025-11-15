import { BaseFracNode } from '@agent-creator/shared-nodes';

export class FracNode extends BaseFracNode {
  constructor() {
    super();
  }

  onExecute() {
    var v = this.getInputData(0);
    this.setOutputData(0, this.fraction(v));
  }
}