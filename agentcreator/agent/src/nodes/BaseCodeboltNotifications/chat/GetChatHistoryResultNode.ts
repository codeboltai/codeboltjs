import { BaseGetChatHistoryResultNode } from '@codebolt/agent-shared-nodes';
import { chatNotifications } from '@codebolt/codeboltjs';

// Backend-specific GetChatHistoryResult Node - actual implementation
export class GetChatHistoryResultNode extends BaseGetChatHistoryResultNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2) || false;
    const toolUseId = this.getInputData(3);

    // Validate required parameters
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required';
      console.error('GetChatHistoryResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      chatNotifications.GetChatHistoryResultNotify(content, isError as boolean, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the resultSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get chat history result`;
      this.setOutputData(1, false);
      console.error('GetChatHistoryResultNode error:', error);
    }
  }
}