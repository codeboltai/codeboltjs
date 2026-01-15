import { BaseGetFirstLinkResultNode } from '@codebolt/agent-shared-nodes';
import { searchNotifications } from '@codebolt/codeboltjs';

// Backend-specific GetFirstLinkResult Node - actual implementation
export class GetFirstLinkResultNode extends BaseGetFirstLinkResultNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = (this.getInputData(2) as boolean) || false;
    const toolUseId = this.getInputData(3);

    // Validate required parameters
    if (!toolUseId) {
      const errorMessage = 'Error: toolUseId is required for get first link result';
      console.error('GetFirstLinkResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (content === null || content === undefined) {
      const errorMessage = 'Error: content is required for get first link result';
      console.error('GetFirstLinkResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      searchNotifications.GetFirstLinkResultNotify(content, isError, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get first link result`;
      this.setOutputData(1, false);
      console.error('GetFirstLinkResultNode error:', error);
    }
  }
}