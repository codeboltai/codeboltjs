import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Browser Search Node - Calls codebolt.browser.search
export class BaseBrowserSearchNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/search",
    title: "Search in Element",
    category: "codebolt/browser",
    description: "Performs a search on the current page using a specified query",
    icon: "🔍",
    color: "#673AB7"
  };

  constructor() {
    super(BaseBrowserSearchNode.metadata.title, BaseBrowserSearchNode.metadata.type);
    this.title = BaseBrowserSearchNode.metadata.title;
    this.size = [180, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for search parameters
    this.addInput("elementId", "string");
    this.addInput("query", "string");

    // Event output for search completion
    this.addOutput("searchCompleted", LiteGraph.EVENT);

    // Output for response data
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
