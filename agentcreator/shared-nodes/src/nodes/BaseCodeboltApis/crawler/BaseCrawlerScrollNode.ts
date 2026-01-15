import { NodeMetadata } from '../../../types';
import { BaseCrawlerActionNode } from './BaseCrawlerActionNode';

export class BaseCrawlerScrollNode extends BaseCrawlerActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/crawler/scroll",
    title: "Crawler Scroll",
    category: "codebolt/crawler",
    description: "Scrolls crawler viewport",
    icon: "🧭",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerScrollNode.metadata, [300, 140]);
    this.addProperty("direction", "down", "string");
    this.addInput("direction", "string");
  }
}
