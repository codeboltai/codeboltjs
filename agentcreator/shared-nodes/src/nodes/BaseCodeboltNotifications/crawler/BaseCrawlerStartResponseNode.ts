import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CrawlerStartResponse Node - Calls codebolt.notify.crawler.CrawlerStartResponseNotify
export class BaseCrawlerStartResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/crawler/crawlerstartresponse",
    title: "Crawler Start Response",
    category: "codebolt/notifications/crawler",
    description: "Sends a crawler start response notification using codebolt.notify.crawler.CrawlerStartResponseNotify",
    icon: "📤",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerStartResponseNode.metadata.title, BaseCrawlerStartResponseNode.metadata.type);
    this.title = BaseCrawlerStartResponseNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required inputs
    this.addInput("content", 0 as any);
    this.addInput("toolUseId", "string");

    // Optional inputs
    this.addInput("isError", "boolean");
    this.addInput("data", "object"); // Contains sessionId, status

    // Event output for responseSent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
