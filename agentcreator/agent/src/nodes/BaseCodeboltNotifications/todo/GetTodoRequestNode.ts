import { BaseGetTodoRequestNode } from '@agent-creator/shared-nodes';
import { todoNotifications } from '@codebolt/codeboltjs';

// Backend-specific GetTodoRequest Node - actual implementation
export class GetTodoRequestNode extends BaseGetTodoRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filtersInput = this.getInputData(1);
    const toolUseId = this.getInputData(2);

    try {
      // Parse filters input - handle JSON object
      let filters: any;
      if (filtersInput) {
        if (typeof filtersInput === 'string') {
          try {
            const parsed = JSON.parse(filtersInput);
            filters = parsed;
          } catch (error) {
            console.error('GetTodoRequestNode: Invalid JSON for filters:', error);
            filters = {};
          }
        } else {
          filters = filtersInput;
        }
      }

      // Call the actual notification function
      todoNotifications.GetTodoRequestNotify(filters as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get todo request`;
      this.setOutputData(1, false);
      console.error('GetTodoRequestNode error:', error);
    }
  }
}