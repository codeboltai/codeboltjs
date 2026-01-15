import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CrawlerSearchResponse Node - Calls codebolt.notify.crawler.CrawlerSearchResponseNotify
export class BaseCrawlerSearchResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/crawler/crawlersearchresponse",
    title: "Crawler Search Response",
    category: "codebolt/notifications/crawler",
    description: "Sends a crawler search response notification using codebolt.notify.crawler.CrawlerSearchResponseNotify",
    icon: "📋",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerSearchResponseNode.metadata.title, BaseCrawlerSearchResponseNode.metadata.type);
    this.title = BaseCrawlerSearchResponseNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required inputs
    this.addInput("content", 0 as any);
    this.addInput("toolUseId", "string");

    // Optional inputs
    this.addInput("isError", "boolean");
    this.addInput("data", "object"); // Contains pages, totalPages, crawlTime

    // Event output for responseSent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  }
