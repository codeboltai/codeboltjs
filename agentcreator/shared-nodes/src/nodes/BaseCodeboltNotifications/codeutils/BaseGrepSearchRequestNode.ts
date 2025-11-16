import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GrepSearchRequestNode - Calls GrepSearchRequestNotify
export class BaseGrepSearchRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/codeutils/request/grepsearch",
    title: "Grep Search Request",
    category: "codebolt/notifications/codeutils",
    description: "Sends a grep search request notification with pattern matching",
    icon: "🔍",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGrepSearchRequestNode.metadata.title, BaseGrepSearchRequestNode.metadata.type);
    this.title = BaseGrepSearchRequestNode.metadata.title;
    this.size = [260, 180];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data input
    this.addInput("pattern", "string");

    // Optional data inputs
    this.addInput("filePath", "string");
    this.addInput("recursive", "boolean");
    this.addInput("ignoreCase", "boolean");
    this.addInput("maxResults", "number");
    this.addInput("toolUseId", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}