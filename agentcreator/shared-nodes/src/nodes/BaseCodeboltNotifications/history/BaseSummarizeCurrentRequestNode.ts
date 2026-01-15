import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SummarizeCurrentRequest Node - Calls history.summarizeCurrentMessage
export class BaseSummarizeCurrentRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/history/summarizecurrentrequest",
    title: "Summarize Current Request",
    category: "codebolt/notifications/history",
    description: "Sends a request to summarize current messages with depth",
    icon: "📄",
    color: "#FFC107"
  };

  constructor() {
    super(BaseSummarizeCurrentRequestNode.metadata.title, BaseSummarizeCurrentRequestNode.metadata.type);
    this.title = BaseSummarizeCurrentRequestNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on summarizeCurrentMessage parameters
    this.addInput("messages", "string"); // JSON string for messages array
    this.addInput("depth", "number");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}