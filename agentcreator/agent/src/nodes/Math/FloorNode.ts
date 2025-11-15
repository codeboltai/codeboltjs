import { BaseFloorNode } from '@agent-creator/shared-nodes';

export class FloorNode extends BaseFloorNode {
  constructor() {
    super();
  }

  onExecute() {
    var v = this.getInputData(0);
    this.setOutputData(0, this.floor(v));
  }
}