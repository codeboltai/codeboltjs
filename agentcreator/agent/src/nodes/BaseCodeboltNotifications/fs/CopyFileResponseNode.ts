import { BaseCopyFileResponseNode } from '@codebolt/agent-shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific CopyFileResponse Node - actual implementation
export class CopyFileResponseNode extends BaseCopyFileResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.CopyFileResponseNotify(content as string, isError as boolean, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send copy file response`;
      this.setOutputData(1, false);
      console.error('CopyFileResponseNode error:', error);
    }
  }
}