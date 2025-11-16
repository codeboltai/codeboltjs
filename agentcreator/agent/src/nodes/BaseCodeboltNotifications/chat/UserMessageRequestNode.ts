import { BaseUserMessageRequestNode } from '@agent-creator/shared-nodes';
import { chatNotifications } from '@codebolt/codeboltjs';

// Backend-specific UserMessageRequest Node - actual implementation
export class UserMessageRequestNode extends BaseUserMessageRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const message = this.getInputData(1);
    const payload = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    // Validate required parameters
    if (!message || typeof message !== 'string') {
      const errorMessage = 'Error: Message is required and must be a string';
      console.error('UserMessageRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      chatNotifications.UserMessageRequestNotify(message, payload as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send user message request`;
      this.setOutputData(1, false);
      console.error('UserMessageRequestNode error:', error);
    }
  }
}