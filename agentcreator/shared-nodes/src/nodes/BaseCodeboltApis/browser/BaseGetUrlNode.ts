import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetUrl Node - Calls codebolt.browser.getUrl
export class BaseGetUrlNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/getUrl",
    title: "Get Current URL",
    category: "codebolt/browser",
    description: "Retrieves the current URL of the browser's active page",
    icon: "🔗",
    color: "#FF9800"
  };

  constructor() {
    super(BaseGetUrlNode.metadata.title, BaseGetUrlNode.metadata.type);
    this.title = BaseGetUrlNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for URL retrieval completion
    this.addOutput("urlRetrieved", LiteGraph.EVENT);

    // Output for URL string
    this.addOutput("url", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}