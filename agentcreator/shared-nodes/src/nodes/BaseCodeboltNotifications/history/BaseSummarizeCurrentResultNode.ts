import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SummarizeCurrentResult Node - Calls history.sendSummarizeCurrentResult
export class BaseSummarizeCurrentResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/history/summarizecurrentresult",
    title: "Summarize Current Result",
    category: "codebolt/notifications/history",
    description: "Sends the result of current message summarization",
    icon: "📋",
    color: "#FF9800"
  };

  constructor() {
    super(BaseSummarizeCurrentResultNode.metadata.title, BaseSummarizeCurrentResultNode.metadata.type);
    this.title = BaseSummarizeCurrentResultNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on sendSummarizeCurrentResult parameters
    this.addInput("content", "object");
    this.addInput("isError", "boolean");
    this.addInput("toolUseId", "string");

    // Event output for response sent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}