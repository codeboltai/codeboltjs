import { BaseWebSearchRequestNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific WebSearchRequest Node - actual implementation
export class WebSearchRequestNode extends BaseWebSearchRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const query = this.getInputData(1);
    const maxResults = this.getInputData(2);
    const searchEngine = this.getInputData(3);
    const filters = this.getInputData(4);

    // Validate required query parameter
    if (!query || typeof query !== 'string' || !query.trim()) {
      const errorMessage = 'Error: Query cannot be empty';
      console.error('WebSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the browser notification function
      codebolt.notify.browser.WebSearchRequestNotify(
        query,
        maxResults as number,
        searchEngine as string,
        filters
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send web search request`;
      this.setOutputData(1, false);
      console.error('WebSearchRequestNode error:', error);
    }
  }
}
