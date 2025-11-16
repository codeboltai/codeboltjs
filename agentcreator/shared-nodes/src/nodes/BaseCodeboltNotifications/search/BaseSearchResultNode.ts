import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SearchResult Node - Calls search.SearchResultNotify
export class BaseSearchResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/search/searchresult",
    title: "Search Result",
    category: "codebolt/notifications/search",
    description: "Sends a search result notification",
    icon: "📄",
    color: "#FF9800"
  };

  constructor() {
    super(BaseSearchResultNode.metadata.title, BaseSearchResultNode.metadata.type);
    this.title = BaseSearchResultNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on SearchResultNotify parameters
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