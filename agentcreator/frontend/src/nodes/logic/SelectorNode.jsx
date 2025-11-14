import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class SelectorNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("sel", "number");
    this.addInput("A");
    this.addInput("B");
    this.addInput("C");
    this.addInput("D");
    this.addOutput("out");

    this.selected = 0;
  }

  onDrawBackground(ctx) {
    if (this.flags.collapsed) {
      return;
    }
    ctx.fillStyle = "#AFB";
    var y = (this.selected + 1) * LiteGraph.NODE_SLOT_HEIGHT + 6;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(50, y + LiteGraph.NODE_SLOT_HEIGHT);
    ctx.lineTo(34, y + LiteGraph.NODE_SLOT_HEIGHT * 0.5);
    ctx.fill();
  }

  onExecute() {
    var sel = this.getInputData(0);
    if (sel == null || sel.constructor !== Number)
      sel = 0;
    this.selected = sel = Math.round(sel) % (this.inputs.length - 1);
    var v = this.getInputData(sel + 1);
    if (v !== undefined) {
      this.setOutputData(0, v);
    }
  }

  onGetInputs() {
    return [["E", 0], ["F", 0], ["G", 0], ["H", 0]];
  }
}

SelectorNode.title = "Selector";
SelectorNode.desc = "selects an output";

export default SelectorNode;
