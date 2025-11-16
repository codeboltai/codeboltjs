import { BaseCopyFileRequestNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific CopyFileRequest Node - actual implementation
export class CopyFileRequestNode extends BaseCopyFileRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const sourceFile = this.getInputData(1);
    const destinationFile = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.CopyFileRequestNotify(sourceFile as string, destinationFile as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send copy file request`;
      this.setOutputData(1, false);
      console.error('CopyFileRequestNode error:', error);
    }
  }
}