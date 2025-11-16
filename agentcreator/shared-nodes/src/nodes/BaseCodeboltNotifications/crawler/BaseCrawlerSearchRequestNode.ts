import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base CrawlerSearchRequest Node - Calls codebolt.notify.crawler.CrawlerSearchRequestNotify
export class BaseCrawlerSearchRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/crawler/crawlersearchrequest",
    title: "Crawler Search Request",
    category: "codebolt/notifications/crawler",
    description: "Sends a crawler search request notification using codebolt.notify.crawler.CrawlerSearchRequestNotify",
    icon: "🔍",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerSearchRequestNode.metadata.title, BaseCrawlerSearchRequestNode.metadata.type);
    this.title = BaseCrawlerSearchRequestNode.metadata.title;
    this.size = [280, 200];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - URL to crawl
    this.addInput("url", "string");

    // Optional inputs
    this.addInput("searchQuery", "string");
    this.addInput("maxDepth", "number");
    this.addInput("maxPages", "number");
    this.addInput("includeSubdomains", "boolean");
    this.addInput("followRedirects", "boolean");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
