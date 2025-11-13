import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class WidgetKnobNode extends LGraphNode {
  constructor() {
    super();
    this.addOutput("", "number");
    this.properties = {
      min: 0,
      max: 1,
      value: 0.5,
      color: "#7AF",
      radius: 10
    };
    this.size = [80, 80];
    this.value = -1;
    this.mousex = null;
    this.mousey = null;
    this.oldmouse = null;
  }

  onDrawForeground(ctx) {
    if (this.value == -1) {
      this.value = (this.properties.value - this.properties.min) / (this.properties.max - this.properties.min);
    }

    var center_x = this.size[0] * 0.5;
    var center_y = this.size[1] * 0.5 + LiteGraph.NODE_TITLE_HEIGHT;
    var radius = Math.min(this.size[0], this.size[1] - LiteGraph.NODE_TITLE_HEIGHT) * 0.5 - 5;

    //bg
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
    ctx.fill();

    //value
    ctx.strokeStyle = this.properties.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      center_x,
      center_y,
      radius,
      -Math.PI * 0.75,
      -Math.PI * 0.75 + this.value * Math.PI * 1.5
    );
    ctx.stroke();

    //inner
    ctx.fillStyle = this.properties.color;
    ctx.beginPath();
    ctx.arc(
      center_x + Math.cos(-Math.PI * 0.75 + this.value * Math.PI * 1.5) * radius * 0.8,
      center_y + Math.sin(-Math.PI * 0.75 + this.value * Math.PI * 1.5) * radius * 0.8,
      radius * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();

    //text
    ctx.fillStyle = "#AAA";
    ctx.font = Math.floor(radius * 0.5) + "px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      this.properties.value.toFixed(2),
      center_x,
      center_y + radius * 0.5
    );
  }

  onExecute() {
    this.properties.value = this.properties.min + (this.properties.max - this.properties.min) * this.value;
    this.setOutputData(0, this.properties.value);
    this.boxcolor = LiteGraph.colorToString([this.value, this.value, this.value]);
  }

  onMouseDown(e) {
    this.oldmouse = [e.canvasX - this.pos[0], e.canvasY - this.pos[1]];
    this.captureInput(true);
    return true;
  }

  onMouseMove(e) {
    if (!this.oldmouse) {
      return;
    }

    var m = [e.canvasX - this.pos[0], e.canvasY - this.pos[1]];

    var centerX = this.size[0] * 0.5;
    var centerY = this.size[1] * 0.5 + LiteGraph.NODE_TITLE_HEIGHT;

    var v = this.value;
    var knobAngle = Math.atan2(m[1] - centerY, m[0] - centerX);
    knobAngle = knobAngle / Math.PI;
    if (knobAngle < -0.5) {
      knobAngle += 2;
    }
    v = (knobAngle + 0.5) / 1.5;
    if (v > 1.0) {
      v = 1.0;
    } else if (v < 0.0) {
      v = 0.0;
    }

    this.value = v;

    this.oldmouse = m;
    this.setDirtyCanvas(true);
  }

  onMouseUp() {
    this.oldmouse = null;
    this.captureInput(false);
  }

  onMouseLeave() {
    this.oldmouse = null;
  }

  onPropertyChanged(name, value) {
    if (name == "min" || name == "max" || name == "value") {
      this.properties[name] = parseFloat(value);
      return true; //block
    }
  }
}

WidgetKnobNode.title = "Knob";
WidgetKnobNode.desc = "Rotational knob controller";

export default WidgetKnobNode;
