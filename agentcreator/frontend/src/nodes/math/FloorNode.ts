import { BaseFloorNode } from '@agent-creator/shared-nodes';

class FloorNode extends BaseFloorNode {
  constructor() {
    super();
  }

  onExecute() {
    var v = this.getInputData(0);
    this.setOutputData(0, this.floor(v));
  }
}

FloorNode.title = "Floor";

export default FloorNode;
