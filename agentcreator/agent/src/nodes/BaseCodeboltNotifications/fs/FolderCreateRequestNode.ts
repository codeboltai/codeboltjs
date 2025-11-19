import { BaseFolderCreateRequestNode } from '@codebolt/agent-shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FolderCreateRequest Node - actual implementation
export class FolderCreateRequestNode extends BaseFolderCreateRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const folderName = this.getInputData(1);
    const folderPath = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.FolderCreateRequestNotify(folderName as string, folderPath as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send folder create request`;
      this.setOutputData(1, false);
      console.error('FolderCreateRequestNode error:', error);
    }
  }
}