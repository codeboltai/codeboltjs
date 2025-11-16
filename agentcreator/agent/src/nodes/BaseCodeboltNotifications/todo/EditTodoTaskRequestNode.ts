import { BaseEditTodoTaskRequestNode } from '@agent-creator/shared-nodes';
import { todoNotifications } from '@codebolt/codeboltjs';

// Backend-specific EditTodoTaskRequest Node - actual implementation
export class EditTodoTaskRequestNode extends BaseEditTodoTaskRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId = this.getInputData(1);
    const title = this.getInputData(2);
    const description = this.getInputData(3);
    const phase = this.getInputData(4);
    const category = this.getInputData(5);
    const priority = this.getInputData(6);
    const tagsInput = this.getInputData(7);
    const status = this.getInputData(8);
    const toolUseId = this.getInputData(9);

    try {
      // Parse tags input - handle both JSON array and comma-separated values
      let tags: string[] | undefined;
      if (tagsInput) {
        if (typeof tagsInput === 'string') {
          // Try to parse as JSON first
          try {
            const parsed = JSON.parse(tagsInput);
            tags = Array.isArray(parsed) ? parsed : [tagsInput];
          } catch {
            // If not JSON, treat as comma-separated values
            tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } else if (Array.isArray(tagsInput)) {
          tags = tagsInput;
        }
      }

      // Call the actual notification function
      todoNotifications.EditTodoTaskRequestNotify(taskId, title, description, phase, category, priority, tags, status, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send edit todo task request`;
      this.setOutputData(1, false);
      console.error('EditTodoTaskRequestNode error:', error);
    }
  }
}