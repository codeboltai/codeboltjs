import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Click Node - Calls codebolt.browser.click
export class BaseClickNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/click",
    title: "Click Element",
    category: "codebolt/browser",
    description: "Clicks on a specified element on the page",
    icon: "👆",
    color: "#FF5722"
  };

  constructor() {
    super(BaseClickNode.metadata.title, BaseClickNode.metadata.type);
    this.title = BaseClickNode.metadata.title;
    this.size = [160, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for element ID
    this.addInput("elementId", "string");

    // Event output for click completion
    this.addOutput("elementClicked", LiteGraph.EVENT);

    // Output for response data
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}