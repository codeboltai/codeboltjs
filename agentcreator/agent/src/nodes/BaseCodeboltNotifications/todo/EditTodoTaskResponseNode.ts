import { BaseEditTodoTaskResponseNode } from '@agent-creator/shared-nodes';
import { todoNotifications } from '@codebolt/codeboltjs';

// Backend-specific EditTodoTaskResponse Node - actual implementation
export class EditTodoTaskResponseNode extends BaseEditTodoTaskResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2) || false;
    const toolUseId = this.getInputData(3);

    // Validate required parameters
    if (!toolUseId) {
      const errorMessage = 'Error: toolUseId is required for edit todo task response';
      console.error('EditTodoTaskResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (content === null || content === undefined) {
      const errorMessage = 'Error: content is required for edit todo task response';
      console.error('EditTodoTaskResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      todoNotifications.EditTodoTaskResponseNotify(content, isError, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send edit todo task response`;
      this.setOutputData(1, false);
      console.error('EditTodoTaskResponseNode error:', error);
    }
  }
}