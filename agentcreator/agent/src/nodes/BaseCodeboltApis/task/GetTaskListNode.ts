import { BaseGetTaskListNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { normalizeTaskStatus, TaskStatus } from './statusHelpers';

// Backend-specific GetTaskList Node - actual implementation
export class GetTaskListNode extends BaseGetTaskListNode {
  constructor() {
    super();
  }

  async onExecute() {
    const threadId: any = this.getInputData(1);
    const status: any = this.getInputData(2);

    const options: { threadId?: string; status?: TaskStatus } = {};
    if (typeof threadId === 'string' && threadId.trim()) options.threadId = threadId.trim();
    const normalizedStatus = normalizeTaskStatus(status);
    if (normalizedStatus) options.status = normalizedStatus;

    try {
      const result: any = await codebolt.task.getTaskList(options);

      // Update outputs with success results
      const tasks = Array.isArray(result?.tasks)
        ? result.tasks
        : Array.isArray(result?.data?.tasks)
          ? result.data.tasks
          : [];
      this.setOutputData(1, tasks); // tasks output
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