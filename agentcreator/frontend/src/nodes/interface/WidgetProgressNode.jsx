import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class WidgetProgressNode extends LGraphNode {
  constructor() {
    super();
    this.size = [160, 26];
    this.addInput("", "number");
    this.properties = { min: 0, max: 1, value: 0, color: "#AAF" };
  }

  onExecute() {
    var v = this.getInputData(0);
    if (v != undefined) {
      this.properties["value"] = v;
    }
  }

  onDrawForeground(ctx) {
    //border
    ctx.lineWidth = 1;
    ctx.fillStyle = this.properties.color;
    var v = (this.properties.value - this.properties.min) / (this.properties.max - this.properties.min);
    v = Math.min(1, v);
    v = Math.max(0, v);
    ctx.fillRect(2, 2, (this.size[0] - 4) * v, this.size[1] - 4);
  }
}

WidgetProgressNode.title = "Progress";
WidgetProgressNode.desc = "Shows data in linear progress";

export default WidgetProgressNode;
