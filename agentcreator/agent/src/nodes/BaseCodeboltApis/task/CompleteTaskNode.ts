import { BaseCompleteTaskNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CompleteTask Node - actual implementation
export class CompleteTaskNode extends BaseCompleteTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('CompleteTaskNode error: taskId is required');
      this.setOutputData(1, false);
      return;
    }

    try {
      const result = await codebolt.task.completeTask(taskId);

      // Update outputs with success results
      this.setOutputData(1, true); // success output

      // Trigger the taskCompleted event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to complete task`;
      this.setOutputData(1, false); // success output
      console.error('CompleteTaskNode error:', error);
    }
  }
}