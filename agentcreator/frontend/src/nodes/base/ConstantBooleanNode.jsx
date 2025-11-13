import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ConstantBooleanNode extends LGraphNode {
  constructor() {
    super();
    this.addOutput("bool", "boolean");
    this.addProperty("value", true);
    this.widget = this.addWidget("toggle", "value", true, "value");
    this.serialize_widgets = true;
    this.widgets_up = true;
    this.size = [140, 30];
  }

  getTitle() {
    if (this.flags.collapsed) {
      return this.properties.value;
    }
    return this.title;
  }

  onExecute() {
    this.setOutputData(0, this.properties["value"]);
  }

  setValue(v) {
    this.setProperty("value", v);
  }

  onGetInputs() {
    return [["toggle", LiteGraph.ACTION]];
  }

  onAction() {
    this.setValue(!this.properties.value);
  }
}

ConstantBooleanNode.title = "Const Boolean";
ConstantBooleanNode.desc = "Constant boolean";

export default ConstantBooleanNode;
