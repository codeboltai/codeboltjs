import { BaseGetChatHistoryRequestNode } from '@agent-creator/shared-nodes';
import { chatNotifications } from '@codebolt/codeboltjs';

// Backend-specific GetChatHistoryRequest Node - actual implementation
export class GetChatHistoryRequestNode extends BaseGetChatHistoryRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const data = this.getInputData(1);
    const toolUseId = this.getInputData(2);

    try {
      // Call the actual notification function
      chatNotifications.GetChatHistoryRequestNotify(data, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get chat history request`;
      this.setOutputData(1, false);
      console.error('GetChatHistoryRequestNode error:', error);
    }
  }
}