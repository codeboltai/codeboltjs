import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SearchRequest Node - Calls search.SearchRequestNotify
export class BaseSearchRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/search/searchrequest",
    title: "Search Request",
    category: "codebolt/notifications/search",
    description: "Sends a search query request notification",
    icon: "🔍",
    color: "#009688"
  };

  constructor() {
    super(BaseSearchRequestNode.metadata.title, BaseSearchRequestNode.metadata.type);
    this.title = BaseSearchRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on SearchRequestNotify parameters
    this.addInput("query", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}