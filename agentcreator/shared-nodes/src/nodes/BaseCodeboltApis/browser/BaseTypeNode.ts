import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Type Node - Calls codebolt.browser.type
export class BaseTypeNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/type",
    title: "Type Text",
    category: "codebolt/browser",
    description: "Types text into a specified element on the page",
    icon: "⌨️",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseTypeNode.metadata.title, BaseTypeNode.metadata.type);
    this.title = BaseTypeNode.metadata.title;
    this.size = [160, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for typing parameters
    this.addInput("elementId", "string");
    this.addInput("text", "string");

    // Event output for typing completion
    this.addOutput("textTyped", LiteGraph.EVENT);

    // Output for response data
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}