import { BaseAppendToFileResponseNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific AppendToFileResponse Node - actual implementation
export class AppendToFileResponseNode extends BaseAppendToFileResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.AppendToFileResponseNotify(content, isError, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send append to file response`;
      this.setOutputData(1, false);
      console.error('AppendToFileResponseNode error:', error);
    }
  }
}