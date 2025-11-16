import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AgentCompletionRequestNode - Calls AgentCompletionNotify
export class BaseAgentCompletionRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/system/request/agent-completion",
    title: "Agent Completion Request",
    category: "codebolt/notifications/system",
    description: "Sends an agent completion notification",
    icon: "⏹️",
    color: "#2196F3"
  };

  constructor() {
    super(BaseAgentCompletionRequestNode.metadata.title, BaseAgentCompletionRequestNode.metadata.type);
    this.title = BaseAgentCompletionRequestNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data input
    this.addInput("resultString", "string");

    // Optional data inputs
    this.addInput("sessionId", "string");
    this.addInput("duration", "string");
    this.addInput("toolUseId", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}