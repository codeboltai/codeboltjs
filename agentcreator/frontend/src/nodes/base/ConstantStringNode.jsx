import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class ConstantStringNode extends LGraphNode {
  constructor() {
    super();
    this.addOutput("string", "string");
    this.addProperty("value", "");
    this.widget = this.addWidget("text", "value", "", "value"); //link to property value
    this.widgets_up = true;
    this.size = [180, 30];
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

  onDropFile(file) {
    var that = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      that.setProperty("value", e.target.result);
    };
    reader.readAsText(file);
  }
}

ConstantStringNode.title = "Const String";
ConstantStringNode.desc = "Constant string";

export default ConstantStringNode;
