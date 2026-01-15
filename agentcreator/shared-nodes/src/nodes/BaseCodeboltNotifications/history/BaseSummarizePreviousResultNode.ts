import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SummarizePreviousResult Node - Calls history.sendSummarizePreviousResult
export class BaseSummarizePreviousResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/history/summarizepreviousresult",
    title: "Summarize Previous Result",
    category: "codebolt/notifications/history",
    description: "Sends the result of previous conversation summarization",
    icon: "📝",
    color: "#FF5722"
  };

  constructor() {
    super(BaseSummarizePreviousResultNode.metadata.title, BaseSummarizePreviousResultNode.metadata.type);
    this.title = BaseSummarizePreviousResultNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on sendSummarizePreviousResult parameters
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