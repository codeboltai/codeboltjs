import { BaseCrawlerScrollNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitCrawlerFailure, emitCrawlerSuccess, getStringInput } from './utils.js';

export class CrawlerScrollNode extends BaseCrawlerScrollNode {
  constructor() {
    super();
  }

  async onExecute() {
    const direction = getStringInput(this, 1, 'direction', 'down');
    if (!direction) {
      emitCrawlerFailure(this, 'Direction is required to scroll');
      return;
    }

    try {
      await codebolt.crawler.scroll(direction);
      emitCrawlerSuccess(this, { direction });
    } catch (error) {
      emitCrawlerFailure(this, 'Failed to scroll', error);
    }
  }
}
