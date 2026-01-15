import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Scroll Node - Calls codebolt.browser.scroll
export class BaseScrollNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/scroll",
    title: "Scroll Page",
    category: "codebolt/browser",
    description: "Scrolls the current page in a specified direction by a specified number of pixels",
    icon: "📜",
    color: "#00BCD4"
  };

  constructor() {
    super(BaseScrollNode.metadata.title, BaseScrollNode.metadata.type);
    this.title = BaseScrollNode.metadata.title;
    this.size = [160, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for scroll parameters
    this.addInput("direction", "string"); // up, down, left, right
    this.addInput("pixels", "string"); // number of pixels as string

    // Event output for scroll completion
    this.addOutput("pageScrolled", LiteGraph.EVENT);

    // Output for response data
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Set default values
    this.properties = {
      direction: "down",
      pixels: "100"
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}