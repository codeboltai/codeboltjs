import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SummarizePreviousRequest Node - Calls history.summarizePreviousConversation
export class BaseSummarizePreviousRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/history/summarizepreviousrequest",
    title: "Summarize Previous Request",
    category: "codebolt/notifications/history",
    description: "Sends a request to summarize the previous conversation",
    icon: "📚",
    color: "#FF9800"
  };

  constructor() {
    super(BaseSummarizePreviousRequestNode.metadata.title, BaseSummarizePreviousRequestNode.metadata.type);
    this.title = BaseSummarizePreviousRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on summarizePreviousConversation parameters
    this.addInput("data", "object");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}