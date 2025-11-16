import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetBrowserInfo Node - Calls codebolt.browser.getBrowserInfo
export class BaseGetBrowserInfoNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/getBrowserInfo",
    title: "Get Browser Info",
    category: "codebolt/browser",
    description: "Retrieves browser info like height, width, scrollX, scrollY of the current page",
    icon: "ℹ️",
    color: "#3F51B5"
  };

  constructor() {
    super(BaseGetBrowserInfoNode.metadata.title, BaseGetBrowserInfoNode.metadata.type);
    this.title = BaseGetBrowserInfoNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for info retrieval completion
    this.addOutput("infoRetrieved", LiteGraph.EVENT);

    // Output for browser info
    this.addOutput("browserInfo", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}