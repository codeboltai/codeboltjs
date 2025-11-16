import { BaseCrawlerSearchResponseNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CrawlerSearchResponse Node - actual implementation
export class CrawlerSearchResponseNode extends BaseCrawlerSearchResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const toolUseId = this.getInputData(2);
    const isError = this.getInputData(3) || false;
    const data = this.getInputData(4);

    // Validate required inputs
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required for crawler search response';
      console.error('CrawlerSearchResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!toolUseId || typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId is required for crawler search response';
      console.error('CrawlerSearchResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the crawler notification function
      codebolt.notify.crawler.CrawlerSearchResponseNotify(
        content,
        isError as boolean,
        toolUseId,
        data as { pages: { url: string; title: string; content: string; depth: number; timestamp: string; }[]; totalPages?: number; crawlTime?: number; }
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send crawler search response`;
      this.setOutputData(1, false);
      console.error('CrawlerSearchResponseNode error:', error);
    }
  }
}
