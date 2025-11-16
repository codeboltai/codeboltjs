import { BaseStartTaskNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific StartTask Node - actual implementation
export class StartTaskNode extends BaseStartTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('StartTaskNode error: taskId is required');
      this.setOutputData(1, false);
      return;
    }

    try {
      const result = await codebolt.task.startTask(taskId);

      // Update outputs with success results
      this.setOutputData(1, true); // success output

      // Trigger the taskStarted event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to start task`;
      this.setOutputData(1, false); // success output
      console.error('StartTaskNode error:', error);
    }
  }
}