import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class RangeNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", "number", { locked: true });
    this.addOutput("out", "number", { locked: true });
    this.addOutput("clamped", "number", { locked: true });

    this.addProperty("in", 0);
    this.addProperty("in_min", 0);
    this.addProperty("in_max", 1);
    this.addProperty("out_min", 0);
    this.addProperty("out_max", 1);

    this.size = [120, 50];
  }

  getTitle() {
    if (this.flags.collapsed) {
      return (this._last_v || 0).toFixed(2);
    }
    return this.title;
  }

  onExecute() {
    if (this.inputs) {
      for (var i = 0; i < this.inputs.length; i++) {
        var input = this.inputs[i];
        var v = this.getInputData(i);
        if (v === undefined) {
          continue;
        }
        this.properties[input.name] = v;
      }
    }

    var inputValue = this.properties["in"];
    if (inputValue === undefined || inputValue === null || inputValue.constructor !== Number) {
      inputValue = 0;
    }

    var in_min = this.properties.in_min;
    var in_max = this.properties.in_max;
    var out_min = this.properties.out_min;
    var out_max = this.properties.out_max;

    this._last_v = ((inputValue - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min;
    this.setOutputData(0, this._last_v);
    this.setOutputData(1, this.clamp(this._last_v, out_min, out_max));
  }

  onDrawBackground() {
    //show the current value
    if (this._last_v) {
      this.outputs[0].label = this._last_v.toFixed(3);
    } else {
      this.outputs[0].label = "?";
    }
  }

  onGetInputs() {
    return [
      ["in_min", "number"],
      ["in_max", "number"],
      ["out_min", "number"],
      ["out_max", "number"]
    ];
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}

RangeNode.title = "Range";
RangeNode.desc = "Convert a number from one range to another";

export default RangeNode;
