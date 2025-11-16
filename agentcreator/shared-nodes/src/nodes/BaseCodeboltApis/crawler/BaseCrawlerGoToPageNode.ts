import { NodeMetadata } from '../../../types';
import { BaseCrawlerActionNode } from './BaseCrawlerActionNode';

export class BaseCrawlerGoToPageNode extends BaseCrawlerActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/crawler/goToPage",
    title: "Crawler Go To Page",
    category: "codebolt/crawler",
    description: "Navigates crawler to a URL",
    icon: "🌐",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerGoToPageNode.metadata, [300, 140]);
    this.addProperty("url", "", "string");
    this.addInput("url", "string");
  }
}
