import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

// Base OnMessage Node - Entry point for agent flows
export class BaseOnMessageNode extends LGraphNode {
  static metadata = {
    type: "events/onmessage",
    title: "OnMessage",
    category: "events",
    description: "Entry point that waits for incoming messages and triggers agent flow",
    icon: "📨",
    color: "#FF5722"
  };

  constructor() {
    super();
    this.title = BaseOnMessageNode.metadata.title;
    this.desc = "Entry point for agent flow - waits for incoming messages";
    this.size = [200, 80];

    // Event output to trigger connected nodes
    this.addOutput("message_received", LiteGraph.EVENT);
    
    // Data output for the payload
    this.addOutput("message", "string");
  }


}