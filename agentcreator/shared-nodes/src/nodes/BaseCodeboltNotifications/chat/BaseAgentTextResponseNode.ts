import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AgentTextResponse Node - Calls chat.AgentTextResponseNotify
export class BaseAgentTextResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/chat/agenttextresponse",
    title: "Agent Text Response",
    category: "codebolt/notifications/chat",
    description: "Sends an agent text response notification",
    icon: "💬",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseAgentTextResponseNode.metadata.title, BaseAgentTextResponseNode.metadata.type);
    this.title = BaseAgentTextResponseNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on AgentTextResponseNotify parameters
    this.addInput("content", "object");
    this.addInput("isError", "boolean");
    this.addInput("toolUseId", "string");
    this.addInput("data", "object");

    // Event output for response sent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}