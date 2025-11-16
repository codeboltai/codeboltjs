import { BaseCrawlerGoToPageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitCrawlerFailure, emitCrawlerSuccess, getStringInput } from './utils';

export class CrawlerGoToPageNode extends BaseCrawlerGoToPageNode {
  constructor() {
    super();
  }

  async onExecute() {
    const url = getStringInput(this, 1, 'url');
    if (!url) {
      emitCrawlerFailure(this, 'URL is required to navigate');
      return;
    }

    try {
      await codebolt.crawler.goToPage(url);
      emitCrawlerSuccess(this, { url });
    } catch (error) {
      emitCrawlerFailure(this, 'Failed to navigate to page', error);
    }
  }
}
