import { BaseGetTodoResponseNode } from '@agent-creator/shared-nodes';
import { todoNotifications } from '@codebolt/codeboltjs';

// Backend-specific GetTodoResponse Node - actual implementation
export class GetTodoResponseNode extends BaseGetTodoResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2) || false;
    const toolUseId = this.getInputData(3);

    // Validate required parameters
    if (!toolUseId) {
      const errorMessage = 'Error: toolUseId is required for get todo response';
      console.error('GetTodoResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (content === null || content === undefined) {
      const errorMessage = 'Error: content is required for get todo response';
      console.error('GetTodoResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      todoNotifications.GetTodoResponseNotify(content, isError, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get todo response`;
      this.setOutputData(1, false);
      console.error('GetTodoResponseNode error:', error);
    }
  }
}