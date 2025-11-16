import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base WebFetchResponse Node - Calls codebolt.notify.browser.WebFetchResponseNotify
export class BaseWebFetchResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/browser/webfetchresponse",
    title: "Web Fetch Response",
    category: "codebolt/notifications/browser",
    description: "Sends a web fetch response notification using codebolt.notify.browser.WebFetchResponseNotify",
    icon: "📦",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseWebFetchResponseNode.metadata.title, BaseWebFetchResponseNode.metadata.type);
    this.title = BaseWebFetchResponseNode.metadata.title;
    this.size = [220, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - response content
    this.addInput("content", 0 as any);

    // Optional inputs
    this.addInput("isError", "boolean");
    this.addInput("data", "object");

    // Event output for responseSent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
