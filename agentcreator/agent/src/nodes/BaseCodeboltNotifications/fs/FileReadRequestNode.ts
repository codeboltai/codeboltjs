import { BaseFileReadRequestNode } from '@codebolt/agent-shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FileReadRequest Node - actual implementation
export class FileReadRequestNode extends BaseFileReadRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filePath = this.getInputData(1);
    const startLine = this.getInputData(2);
    const endLine = this.getInputData(3);
    const toolUseId = this.getInputData(4);

    try {
      // Call the actual notification function
      fsNotifications.FileReadRequestNotify(filePath as string, startLine as string, endLine as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send file read request`;
      this.setOutputData(1, false);
      console.error('FileReadRequestNode error:', error);
    }
  }
}