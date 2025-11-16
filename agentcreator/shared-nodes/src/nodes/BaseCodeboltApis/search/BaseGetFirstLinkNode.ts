import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetFirstLink Node - Calls codebolt.search.get_first_link
export class BaseGetFirstLinkNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/search/getfirstlink",
    title: "Get First Link",
    category: "codebolt/search",
    description: "Retrieves the first link from search results using codebolt.search.get_first_link",
    icon: "🔗",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGetFirstLinkNode.metadata.title, BaseGetFirstLinkNode.metadata.type);
    this.title = BaseGetFirstLinkNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for the search query
    this.addInput("query", "string");

    // Event output for linkRetrieved
    this.addOutput("linkRetrieved", LiteGraph.EVENT);

    // Output for the first link
    this.addOutput("link", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}