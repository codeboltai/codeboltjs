import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GoToPage Node - Calls codebolt.browser.goToPage
export class BaseGoToPageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/goToPage",
    title: "Go To Page",
    category: "codebolt/browser",
    description: "Navigates to a specified URL",
    icon: "🧭",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGoToPageNode.metadata.title, BaseGoToPageNode.metadata.type);
    this.title = BaseGoToPageNode.metadata.title;
    this.size = [180, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for URL to navigate to
    this.addInput("url", "string");

    // Event output for navigation completion
    this.addOutput("pageLoaded", LiteGraph.EVENT);

    // Output for response data
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}