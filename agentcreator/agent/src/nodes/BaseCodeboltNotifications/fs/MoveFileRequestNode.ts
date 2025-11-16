import { BaseMoveFileRequestNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific MoveFileRequest Node - actual implementation
export class MoveFileRequestNode extends BaseMoveFileRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const sourceFile = this.getInputData(1);
    const destinationFile = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.MoveFileRequestNotify(sourceFile as string, destinationFile as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send move file request`;
      this.setOutputData(1, false);
      console.error('MoveFileRequestNode error:', error);
    }
  }
}