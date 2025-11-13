import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class TimeNode extends LGraphNode {
  constructor() {
    super();
    this.addOutput("in ms", "number");
    this.addOutput("in sec", "number");
    this.size = [80, 30];
  }

  onExecute() {
    this.setOutputData(0, this.graph.globaltime * 1000);
    this.setOutputData(1, this.graph.globaltime);
  }
}

TimeNode.title = "Time";
TimeNode.desc = "Time";

export default TimeNode;
