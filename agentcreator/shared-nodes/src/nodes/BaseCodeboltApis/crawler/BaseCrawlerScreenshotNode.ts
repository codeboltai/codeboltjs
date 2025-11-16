import { NodeMetadata } from '../../../types';
import { BaseCrawlerActionNode } from './BaseCrawlerActionNode';

export class BaseCrawlerScreenshotNode extends BaseCrawlerActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/crawler/screenshot",
    title: "Crawler Screenshot",
    category: "codebolt/crawler",
    description: "Takes a crawler screenshot",
    icon: "📸",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerScreenshotNode.metadata);
  }
}
