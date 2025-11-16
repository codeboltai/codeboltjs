import { BaseCrawlerSearchRequestNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CrawlerSearchRequest Node - actual implementation
export class CrawlerSearchRequestNode extends BaseCrawlerSearchRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const url = this.getInputData(1);
    const searchQuery = this.getInputData(2);
    const maxDepth = this.getInputData(3);
    const maxPages = this.getInputData(4);
    const includeSubdomains = this.getInputData(5);
    const followRedirects = this.getInputData(6);

    // Validate required URL parameter
    if (!url || typeof url !== 'string') {
      const errorMessage = 'Error: URL is required for crawler search request';
      console.error('CrawlerSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      const errorMessage = `Error: Invalid URL format for crawler search request: ${url}`;
      console.error('CrawlerSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the crawler notification function
      codebolt.notify.crawler.CrawlerSearchRequestNotify(
        url,
        searchQuery as string,
        maxDepth as number,
        maxPages as number,
        includeSubdomains as boolean,
        followRedirects as boolean
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send crawler search request`;
      this.setOutputData(1, false);
      console.error('CrawlerSearchRequestNode error:', error);
    }
  }
}
