import { BaseWriteToFileResponseNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific WriteToFileResponse Node - actual implementation
export class WriteToFileResponseNode extends BaseWriteToFileResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Call the actual notification function
      fsNotifications.WriteToFileResponseNotify(content, isError as boolean, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send write to file response`;
      this.setOutputData(1, false);
      console.error('WriteToFileResponseNode error:', error);
    }
  }
}