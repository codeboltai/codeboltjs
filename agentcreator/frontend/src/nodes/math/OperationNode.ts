import { BaseOperationNode } from '@agent-creator/shared-nodes';

class OperationNode extends BaseOperationNode {
  constructor() {
    super();
    this.addInput("A", "number,array,object");
    this.addInput("B", "number");
    this.addOutput("=", "number");
    this._result = []; //only used for arrays
  }

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
    this._func = BaseOperationNode.operationFuncs[this.properties.OP];
    if (!this._func) {
      console.warn("Unknown operation: " + this.properties.OP);
      this._func = function(A) { return A; };
    }
  }

  onExecute() {
    let A = this.getInputData(0);
    let B = this.getInputData(1);
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

    let result = this.performOperation(A, B, this.properties.OP);
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

export default OperationNode;