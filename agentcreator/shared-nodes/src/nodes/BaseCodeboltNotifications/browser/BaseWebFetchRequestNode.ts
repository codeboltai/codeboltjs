import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base WebFetchRequest Node - Calls codebolt.notify.browser.WebFetchRequestNotify
export class BaseWebFetchRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/browser/webfetchrequest",
    title: "Web Fetch Request",
    category: "codebolt/notifications/browser",
    description: "Sends a web fetch request notification using codebolt.notify.browser.WebFetchRequestNotify",
    icon: "🌐",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseWebFetchRequestNode.metadata.title, BaseWebFetchRequestNode.metadata.type);
    this.title = BaseWebFetchRequestNode.metadata.title;
    this.size = [220, 180];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - URL to fetch
    this.addInput("url", "string");

    // Optional inputs
    this.addInput("method", "string");
    this.addInput("headers", "object");
    this.addInput("body", 0 as any);
    this.addInput("timeout", "number");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
