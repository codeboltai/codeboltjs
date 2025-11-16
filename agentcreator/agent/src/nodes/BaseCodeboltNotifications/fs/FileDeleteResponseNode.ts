import { BaseFileDeleteResponseNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FileDeleteResponse Node - actual implementation
export class FileDeleteResponseNode extends BaseFileDeleteResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.FileDeleteResponseNotify(content, isError as boolean, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send file delete response`;
      this.setOutputData(1, false);
      console.error('FileDeleteResponseNode error:', error);
    }
  }
}