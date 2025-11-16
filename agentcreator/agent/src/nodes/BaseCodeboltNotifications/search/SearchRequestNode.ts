import { BaseSearchRequestNode } from '@agent-creator/shared-nodes';
import { searchNotifications } from '@codebolt/codeboltjs';

// Backend-specific SearchRequest Node - actual implementation
export class SearchRequestNode extends BaseSearchRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const query = this.getInputData(1) as string;
    const toolUseId = this.getInputData(2);

    // Validate required parameters
    if (!query || typeof query !== 'string' || query.trim() === '') {
      const errorMessage = 'Error: query is required and must be a non-empty string';
      console.error('SearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      searchNotifications.SearchRequestNotify(query, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send search request`;
      this.setOutputData(1, false);
      console.error('SearchRequestNode error:', error);
    }
  }
}