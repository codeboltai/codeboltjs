import { NodeMetadata } from '../../../types';
import { BaseCrawlerActionNode } from './BaseCrawlerActionNode';

export class BaseCrawlerClickNode extends BaseCrawlerActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/crawler/click",
    title: "Crawler Click",
    category: "codebolt/crawler",
    description: "Clicks an element in crawler",
    icon: "🖱️",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerClickNode.metadata, [300, 140]);
    this.addProperty("elementId", "", "string");
    this.addInput("elementId", "string");
  }
}
