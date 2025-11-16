import { BaseFolderDeleteRequestNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FolderDeleteRequest Node - actual implementation
export class FolderDeleteRequestNode extends BaseFolderDeleteRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const folderName = this.getInputData(1);
    const folderPath = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.FolderDeleteRequestNotify(folderName, folderPath, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send folder delete request`;
      this.setOutputData(1, false);
      console.error('FolderDeleteRequestNode error:', error);
    }
  }
}