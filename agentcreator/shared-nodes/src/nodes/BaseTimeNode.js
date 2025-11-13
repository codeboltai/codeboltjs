import { LGraphNode } from '@comfyorg/litegraph';

// Base Time Node - shared metadata and structure
export class BaseTimeNode extends LGraphNode {
  static metadata = {
    type: "basic/time",
    title: "Time",
    category: "basic",
    description: "Current time in ms and seconds",
    icon: "⏰",
    color: "#FFC107"
  };

  constructor() {
    super();
    this.title = BaseTimeNode.metadata.title;
    this.addOutput("in ms", "number");
    this.addOutput("in sec", "number");
    this.size = [80, 30];
  }

  // Shared calculation logic
  getCurrentTime(graph) {
    return {
      milliseconds: graph.globaltime * 1000,
      seconds: graph.globaltime
    };
  }
}