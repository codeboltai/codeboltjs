import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Enter Node - Calls codebolt.browser.enter
export class BaseEnterNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/enter",
    title: "Press Enter",
    category: "codebolt/browser",
    description: "Simulates the Enter key press on the current page",
    icon: "↩️",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseEnterNode.metadata.title, BaseEnterNode.metadata.type);
    this.title = BaseEnterNode.metadata.title;
    this.size = [180, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for enter press completion
    this.addOutput("enterPressed", LiteGraph.EVENT);

    // Output for response data
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}