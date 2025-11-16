import { BaseFileReadResponseNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FileReadResponse Node - actual implementation
export class FileReadResponseNode extends BaseFileReadResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.FileReadResponseNotify(content, isError as boolean, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send file read response`;
      this.setOutputData(1, false);
      console.error('FileReadResponseNode error:', error);
    }
  }
}