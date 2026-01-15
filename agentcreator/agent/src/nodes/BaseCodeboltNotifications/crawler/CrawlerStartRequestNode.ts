import { BaseCrawlerStartRequestNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CrawlerStartRequest Node - actual implementation
export class CrawlerStartRequestNode extends BaseCrawlerStartRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const startUrl = this.getInputData(1);
    const options = this.getInputData(2);

    // Validate required startUrl parameter
    if (!startUrl || typeof startUrl !== 'string') {
      const errorMessage = 'Error: Start URL is required for crawler start request';
      console.error('CrawlerStartRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Validate URL format
    try {
      new URL(startUrl);
    } catch (error) {
      const errorMessage = `Error: Invalid URL format for crawler start request: ${startUrl}`;
      console.error('CrawlerStartRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the crawler notification function
      codebolt.notify.crawler.CrawlerStartRequestNotify(
        startUrl,
        options
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send crawler start request`;
      this.setOutputData(1, false);
      console.error('CrawlerStartRequestNode error:', error);
    }
  }
}
