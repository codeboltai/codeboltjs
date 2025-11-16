import { BaseCrawlerScreenshotNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitCrawlerFailure, emitCrawlerSuccess } from './utils';

export class CrawlerScreenshotNode extends BaseCrawlerScreenshotNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      await codebolt.crawler.screenshot();
      emitCrawlerSuccess(this);
    } catch (error) {
      emitCrawlerFailure(this, 'Failed to capture screenshot', error);
    }
  }
}
