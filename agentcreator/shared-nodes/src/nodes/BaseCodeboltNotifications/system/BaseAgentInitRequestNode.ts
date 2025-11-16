import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AgentInitRequestNode - Calls AgentInitNotify
export class BaseAgentInitRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/system/request/agent-init",
    title: "Agent Init Request",
    category: "codebolt/notifications/system",
    description: "Sends an agent initialization notification",
    icon: "▶️",
    color: "#2196F3"
  };

  constructor() {
    super(BaseAgentInitRequestNode.metadata.title, BaseAgentInitRequestNode.metadata.type);
    this.title = BaseAgentInitRequestNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data inputs
    this.addInput("onStopClicked", "boolean");
    this.addInput("toolUseId", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}