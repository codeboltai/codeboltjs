import { BaseListDirectoryRequestNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific ListDirectoryRequest Node - actual implementation
export class ListDirectoryRequestNode extends BaseListDirectoryRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const dirPath = this.getInputData(1);
    const toolUseId = this.getInputData(2);

    try {
      // Call the actual notification function
      fsNotifications.ListDirectoryRequestNotify(dirPath, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send list directory request`;
      this.setOutputData(1, false);
      console.error('ListDirectoryRequestNode error:', error);
    }
  }
}