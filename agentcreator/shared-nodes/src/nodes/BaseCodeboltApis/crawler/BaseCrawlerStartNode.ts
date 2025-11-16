import { NodeMetadata } from '../../../types';
import { BaseCrawlerActionNode } from './BaseCrawlerActionNode';

export class BaseCrawlerStartNode extends BaseCrawlerActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/crawler/start",
    title: "Crawler Start",
    category: "codebolt/crawler",
    description: "Starts the crawler",
    icon: "▶️",
    color: "#8BC34A"
  };

  constructor() {
    super(BaseCrawlerStartNode.metadata);
  }
}
