import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetHTML Node - Calls codebolt.browser.getHTML
export class BaseGetHTMLNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/getHTML",
    title: "Get HTML Content",
    category: "codebolt/browser",
    description: "Retrieves the HTML content of the current page",
    icon: "🏗️",
    color: "#FF5722"
  };

  constructor() {
    super(BaseGetHTMLNode.metadata.title, BaseGetHTMLNode.metadata.type);
    this.title = BaseGetHTMLNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for HTML retrieval completion
    this.addOutput("htmlRetrieved", LiteGraph.EVENT);

    // Output for HTML content
    this.addOutput("html", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}