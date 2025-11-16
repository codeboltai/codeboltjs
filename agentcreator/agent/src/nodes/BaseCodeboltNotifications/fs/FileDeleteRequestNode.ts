import { BaseFileDeleteRequestNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FileDeleteRequest Node - actual implementation
export class FileDeleteRequestNode extends BaseFileDeleteRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const fileName = this.getInputData(1);
    const filePath = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.FileDeleteRequestNotify(fileName, filePath, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send file delete request`;
      this.setOutputData(1, false);
      console.error('FileDeleteRequestNode error:', error);
    }
  }
}