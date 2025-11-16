import { BaseSearchResultNode } from '@agent-creator/shared-nodes';
import { searchNotifications } from '@codebolt/codeboltjs';

// Backend-specific SearchResult Node - actual implementation
export class SearchResultNode extends BaseSearchResultNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = (this.getInputData(2) as boolean) || false;
    const toolUseId = this.getInputData(3);

    // Validate required parameters
    if (!toolUseId) {
      const errorMessage = 'Error: toolUseId is required for search result';
      console.error('SearchResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (content === null || content === undefined) {
      const errorMessage = 'Error: content is required for search result';
      console.error('SearchResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      searchNotifications.SearchResultNotify(content, isError, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send search result`;
      this.setOutputData(1, false);
      console.error('SearchResultNode error:', error);
    }
  }
}