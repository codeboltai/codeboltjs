import { BaseFileEditResponseNode } from '@codebolt/agent-shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FileEditResponse Node - actual implementation
export class FileEditResponseNode extends BaseFileEditResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.FileEditResponseNotify(content, isError as boolean, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send file edit response`;
      this.setOutputData(1, false);
      console.error('FileEditResponseNode error:', error);
    }
  }
}