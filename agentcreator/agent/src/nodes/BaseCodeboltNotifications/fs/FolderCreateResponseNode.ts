import { BaseFolderCreateResponseNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FolderCreateResponse Node - actual implementation
export class FolderCreateResponseNode extends BaseFolderCreateResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.FolderCreateResponseNotify(content, isError, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send folder create response`;
      this.setOutputData(1, false);
      console.error('FolderCreateResponseNode error:', error);
    }
  }
}