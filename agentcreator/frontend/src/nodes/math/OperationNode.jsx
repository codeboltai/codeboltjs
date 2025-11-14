import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class OperationNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("A", "number,array,object");
    this.addInput("B", "number");
    this.addOutput("=", "number");
    this.addProperty("A", 1);
    this.addProperty("B", 1);
    this.addProperty("OP", "+", "enum", { values: OperationNode.values });
    this._func = OperationNode.funcs[this.properties.OP];
    this._result = []; //only used for arrays
    this.size = [100, 60];
  }

  static values = ["+", "-", "*", "/", "%", "^", "max", "min"];
  
  static funcs = {
    "+": function(A, B) { return A + B; },
    "-": function(A, B) { return A - B; },
    "x": function(A, B) { return A * B; },
    "X": function(A, B) { return A * B; },
    "*": function(A, B) { return A * B; },
    "/": function(A, B) { return A / B; },
    "%": function(A, B) { return A % B; },
    "^": function(A, B) { return Math.pow(A, B); },
    "max": function(A, B) { return Math.max(A, B); },
    "min": function(A, B) { return Math.min(A, B); }
  };

  getTitle() {
    if (this.properties.OP == "max" || this.properties.OP == "min")
      return this.properties.OP + "(A,B)";
    return "A " + this.properties.OP + " B";
  }

  setValue(v) {
    if (typeof v == "string") {
      v = parseFloat(v);
    }
    this.properties["value"] = v;
  }

  onPropertyChanged(name, value) {
    if (name != "OP")
      return;
    this._func = OperationNode.funcs[this.properties.OP];
    if (!this._func) {
      console.warn("Unknown operation: " + this.properties.OP);
      this._func = function(A) { return A; };
    }
  }

  onExecute() {
    var A = this.getInputData(0);
    var B = this.getInputData(1);
    if (A != null) {
      if (A.constructor === Number)
        this.properties["A"] = A;
    } else {
      A = this.properties["A"];
    }

    if (B != null) {
      this.properties["B"] = B;
    } else {
      B = this.properties["B"];
    }

    var func = OperationNode.funcs[this.properties.OP];

    var result;
    if (A.constructor === Number) {
      result = 0;
      result = func(A, B);
    } else if (A.constructor === Array) {
      result = this._result;
      result.length = A.length;
      for (var j = 0; j < A.length; ++j)
        result[j] = func(A[j], B);
    } else {
      result = {};
      for (var i in A)
        result[i] = func(A[i], B);
    }
    this.setOutputData(0, result);
  }

  onDrawBackground(ctx) {
    if (this.flags.collapsed) {
      return;
    }

    ctx.font = "40px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText(
      this.properties.OP,
      this.size[0] * 0.5,
      (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5
    );
    ctx.textAlign = "left";
  }
}

OperationNode.title = "Operation";
OperationNode.desc = "Easy math operators";

export default OperationNode;
