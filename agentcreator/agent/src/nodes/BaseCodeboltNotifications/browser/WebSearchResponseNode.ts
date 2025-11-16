import { BaseWebSearchResponseNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific WebSearchResponse Node - actual implementation
export class WebSearchResponseNode extends BaseWebSearchResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2) || false;
    const data = this.getInputData(3);

    // Validate content is provided
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required for web search response';
      console.error('WebSearchResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the browser notification function
      codebolt.notify.browser.WebSearchResponseNotify(
        content,
        isError as boolean,
        undefined, // toolUseId - let it auto-generate
        data as { results: { title: string; url: string; snippet: string; rank?: number; }[]; totalResults?: number; searchTime?: number; }
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send web search response`;
      this.setOutputData(1, false);
      console.error('WebSearchResponseNode error:', error);
    }
  }
}
