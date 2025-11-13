import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ConstantObjectNode extends LGraphNode {
  constructor() {
    super();
    this.addOutput("obj", "object");
    this.size = [120, 30];
    this._object = {};
  }

  onExecute() {
    this.setOutputData(0, this._object);
  }
}

ConstantObjectNode.title = "Const Object";
ConstantObjectNode.desc = "Constant Object";

export default ConstantObjectNode;
