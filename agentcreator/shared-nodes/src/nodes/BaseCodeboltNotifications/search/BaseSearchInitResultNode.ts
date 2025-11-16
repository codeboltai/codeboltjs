import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SearchInitResult Node - Calls search.SearchInitResultNotify
export class BaseSearchInitResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/search/searchinitresult",
    title: "Search Init Result",
    category: "codebolt/notifications/search",
    description: "Sends a search engine initialization result notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseSearchInitResultNode.metadata.title, BaseSearchInitResultNode.metadata.type);
    this.title = BaseSearchInitResultNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on SearchInitResultNotify parameters
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