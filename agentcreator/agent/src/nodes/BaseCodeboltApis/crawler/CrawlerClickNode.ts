import { BaseCrawlerClickNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitCrawlerFailure, emitCrawlerSuccess, getStringInput } from './utils.js';

export class CrawlerClickNode extends BaseCrawlerClickNode {
  constructor() {
    super();
  }

  async onExecute() {
    const elementId = getStringInput(this, 1, 'elementId');
    if (!elementId) {
      emitCrawlerFailure(this, 'Element ID is required for click action');
      return;
    }

    try {
      const response = await codebolt.crawler.click(elementId);
      emitCrawlerSuccess(this, response);
    } catch (error) {
      emitCrawlerFailure(this, 'Failed to click element', error);
    }
  }
}
