import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ConstantNumberNode extends LGraphNode {
  title = "Const Number";
  desc = "Constant number";
  constructor() {
    super();
    this.addOutput("value", "number");
    this.addProperty("value", 1.0);
    this.widget = this.addWidget("number", "value", 1, "value");
    this.widgets_up = true;
    this.size = [180, 30];
  }

  onExecute() {
    this.setOutputData(0, parseFloat(this.properties["value"]));
  }

  getTitle() {
    if (this.flags.collapsed) {
      return this.properties.value;
    }
    return this.title;
  }

  setValue(v) {
    this.setProperty("value", v);
  }

  onDrawBackground() {
    //show the current value
    this.outputs[0].label = this.properties["value"].toFixed(3);
  }
}

ConstantNumberNode.title = "Const Number";
ConstantNumberNode.desc = "Constant number";

export default ConstantNumberNode;
