import { BaseGetTaskListNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetTaskList Node - actual implementation
export class GetTaskListNode extends BaseGetTaskListNode {
  constructor() {
    super();
  }

  async onExecute() {
    const threadId: any = this.getInputData(1);
    const status: any = this.getInputData(2);

    const options = {};
    if (threadId) options.threadId = threadId;
    if (status) options.status = status;

    try {
      const result = await codebolt.task.getTaskList(options);

      // Update outputs with success results
      this.setOutputData(1, result.tasks || []); // tasks output
      this.setOutputData(2, true); // success output

      // Trigger the taskListRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get task list`;
      this.setOutputData(1, []); // tasks output
      this.setOutputData(2, false); // success output
      console.error('GetTaskListNode error:', error);
    }
  }
}