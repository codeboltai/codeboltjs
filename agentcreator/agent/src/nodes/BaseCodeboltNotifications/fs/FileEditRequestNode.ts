import { BaseFileEditRequestNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FileEditRequest Node - actual implementation
export class FileEditRequestNode extends BaseFileEditRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const fileName = this.getInputData(1);
    const filePath = this.getInputData(2);
    const newContent = this.getInputData(3);
    const toolUseId = this.getInputData(4);

    try {
      // Call the actual notification function
      fsNotifications.FileEditRequestNotify(fileName as string, filePath as string, newContent as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send file edit request`;
      this.setOutputData(1, false);
      console.error('FileEditRequestNode error:', error);
    }
  }
}