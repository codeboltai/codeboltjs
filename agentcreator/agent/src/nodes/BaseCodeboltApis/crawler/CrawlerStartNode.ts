import { BaseCrawlerStartNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitCrawlerFailure, emitCrawlerSuccess } from './utils.js';

export class CrawlerStartNode extends BaseCrawlerStartNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      await codebolt.crawler.start();
      emitCrawlerSuccess(this);
    } catch (error) {
      emitCrawlerFailure(this, 'Failed to start crawler', error);
    }
  }
}
