import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base WebSearchResponse Node - Calls codebolt.notify.browser.WebSearchResponseNotify
export class BaseWebSearchResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/browser/websearchresponse",
    title: "Web Search Response",
    category: "codebolt/notifications/browser",
    description: "Sends a web search response notification using codebolt.notify.browser.WebSearchResponseNotify",
    icon: "📊",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseWebSearchResponseNode.metadata.title, BaseWebSearchResponseNode.metadata.type);
    this.title = BaseWebSearchResponseNode.metadata.title;
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

  }
