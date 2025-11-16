import { BaseSearchInitResultNode } from '@agent-creator/shared-nodes';
import { searchNotifications } from '@codebolt/codeboltjs';

// Backend-specific SearchInitResult Node - actual implementation
export class SearchInitResultNode extends BaseSearchInitResultNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2) || false;
    const toolUseId = this.getInputData(3);

    // Validate required parameters
    if (!toolUseId) {
      const errorMessage = 'Error: toolUseId is required for search init result';
      console.error('SearchInitResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (content === null || content === undefined) {
      const errorMessage = 'Error: content is required for search init result';
      console.error('SearchInitResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      searchNotifications.SearchInitResultNotify(content, isError, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send search init result`;
      this.setOutputData(1, false);
      console.error('SearchInitResultNode error:', error);
    }
  }
}