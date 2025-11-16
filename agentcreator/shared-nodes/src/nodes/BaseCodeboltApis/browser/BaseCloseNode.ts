import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Close Node - Calls codebolt.browser.close
export class BaseCloseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/close",
    title: "Close Browser Page",
    category: "codebolt/browser",
    description: "Closes the current page",
    icon: "❌",
    color: "#F44336"
  };

  constructor() {
    super(BaseCloseNode.metadata.title, BaseCloseNode.metadata.type);
    this.title = BaseCloseNode.metadata.title;
    this.size = [180, 60];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Note: close is void function - doesn't return a promise
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}