import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base CrawlerStartRequest Node - Calls codebolt.notify.crawler.CrawlerStartRequestNotify
export class BaseCrawlerStartRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/crawler/crawlerstartrequest",
    title: "Crawler Start Request",
    category: "codebolt/notifications/crawler",
    description: "Sends a crawler start request notification using codebolt.notify.crawler.CrawlerStartRequestNotify",
    icon: "▶️",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerStartRequestNode.metadata.title, BaseCrawlerStartRequestNode.metadata.type);
    this.title = BaseCrawlerStartRequestNode.metadata.title;
    this.size = [260, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - URL to start crawling from
    this.addInput("startUrl", "string");

    // Optional input - crawler configuration options
    this.addInput("options", "object"); // Contains userAgent, timeout, headers

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
