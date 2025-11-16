import { BaseAddTodoRequestNode } from '@agent-creator/shared-nodes';
import { todoNotifications } from '@codebolt/codeboltjs';

// Backend-specific AddTodoRequest Node - actual implementation
export class AddTodoRequestNode extends BaseAddTodoRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const title = this.getInputData(1);
    const agentId = this.getInputData(2);
    const description = this.getInputData(3);
    const phase = this.getInputData(4);
    const category = this.getInputData(5);
    const priority = this.getInputData(6);
    const tagsInput = this.getInputData(7);
    const toolUseId = this.getInputData(8);

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
      todoNotifications.AddTodoRequestNotify(title as string, agentId as string, description as string, phase as string, category as string, priority as string, tags, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send add todo request`;
      this.setOutputData(1, false);
      console.error('AddTodoRequestNode error:', error);
    }
  }
}