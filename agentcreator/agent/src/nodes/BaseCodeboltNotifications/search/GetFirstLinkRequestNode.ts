import { BaseGetFirstLinkRequestNode } from '@agent-creator/shared-nodes';
import { searchNotifications } from '@codebolt/codeboltjs';

// Backend-specific GetFirstLinkRequest Node - actual implementation
export class GetFirstLinkRequestNode extends BaseGetFirstLinkRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const query = this.getInputData(1);
    const toolUseId = this.getInputData(2);

    // Validate required parameters
    if (!query || typeof query !== 'string' || query.trim() === '') {
      const errorMessage = 'Error: query is required and must be a non-empty string';
      console.error('GetFirstLinkRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      searchNotifications.GetFirstLinkRequestNotify(query, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get first link request`;
      this.setOutputData(1, false);
      console.error('GetFirstLinkRequestNode error:', error);
    }
  }
}