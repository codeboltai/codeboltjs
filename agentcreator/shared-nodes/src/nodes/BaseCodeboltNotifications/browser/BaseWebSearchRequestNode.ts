import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base WebSearchRequest Node - Calls codebolt.notify.browser.WebSearchRequestNotify
export class BaseWebSearchRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/browser/websearchrequest",
    title: "Web Search Request",
    category: "codebolt/notifications/browser",
    description: "Sends a web search request notification using codebolt.notify.browser.WebSearchRequestNotify",
    icon: "🔍",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseWebSearchRequestNode.metadata.title, BaseWebSearchRequestNode.metadata.type);
    this.title = BaseWebSearchRequestNode.metadata.title;
    this.size = [220, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - search query
    this.addInput("query", "string");

    // Optional inputs
    this.addInput("maxResults", "number");
    this.addInput("searchEngine", "string");
    this.addInput("filters", "object");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  }
