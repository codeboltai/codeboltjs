import { BaseAppendToFileRequestNode } from '@codebolt/agent-shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific AppendToFileRequest Node - actual implementation
export class AppendToFileRequestNode extends BaseAppendToFileRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filePath = this.getInputData(1);
    const text = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.AppendToFileRequestNotify(filePath as string, text as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send append to file request`;
      this.setOutputData(1, false);
      console.error('AppendToFileRequestNode error:', error);
    }
  }
}