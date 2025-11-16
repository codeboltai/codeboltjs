import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SendSteeringMessage Node - Calls codebolt.task.sendSteeringMessage
export class BaseSendSteeringMessageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/sendsteeringmessage",
    title: "Send Steering Message",
    category: "codebolt/task",
    description: "Sends a steering message to a running step using codebolt.task.sendSteeringMessage",
    icon: "🎯",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseSendSteeringMessageNode.metadata.title, BaseSendSteeringMessageNode.metadata.type);
    this.title = BaseSendSteeringMessageNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("stepId", "string");
    this.addInput("message", "string");
    this.addInput("messageType", "string");

    // Event output for steeringMessageSent
    this.addOutput("steeringMessageSent", LiteGraph.EVENT);

    // Output for response object
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}