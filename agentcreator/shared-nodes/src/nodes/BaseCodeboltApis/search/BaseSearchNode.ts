import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Search Node - Calls codebolt.search.search
export class BaseSearchNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/search/search",
    title: "Search",
    category: "codebolt/search",
    description: "Performs a search operation using codebolt.search.search",
    icon: "🔍",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseSearchNode.metadata.title, BaseSearchNode.metadata.type);
    this.title = BaseSearchNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for the search query
    this.addInput("query", "string");

    // Event output for searchCompleted
    this.addOutput("searchCompleted", LiteGraph.EVENT);

    // Output for search results
    this.addOutput("results", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}