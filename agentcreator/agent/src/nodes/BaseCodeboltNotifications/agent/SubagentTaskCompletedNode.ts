import { BaseSubagentTaskCompletedNode } from '@agent-creator/shared-nodes';
import { SubagentTaskCompletedNotify } from '@codebolt/codeboltjs';

// Backend SubagentTaskCompletedNode - actual implementation
export class SubagentTaskCompletedNode extends BaseSubagentTaskCompletedNode {
  constructor() {
    super();
  }

  async onExecute() {
    const parentAgentId: any = this.getInputData(1);
    const subagentId: any = this.getInputData(2);
    const taskId: any = this.getInputData(3);
    const result: any = this.getInputData(4);
    const status: any = this.getInputData(5);

    // Validate required inputs
    if (!parentAgentId || typeof parentAgentId !== 'string' || !parentAgentId.trim()) {
      const errorMessage = 'Error: Parent Agent ID is required';
      console.error('SubagentTaskCompletedNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!subagentId || typeof subagentId !== 'string' || !subagentId.trim()) {
      const errorMessage = 'Error: Subagent ID is required';
      console.error('SubagentTaskCompletedNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!taskId || typeof taskId !== 'string' || !taskId.trim()) {
      const errorMessage = 'Error: Task ID is required';
      console.error('SubagentTaskCompletedNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (result === null || result === undefined) {
      const errorMessage = 'Error: Task result is required';
      console.error('SubagentTaskCompletedNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!status || typeof status !== 'string' || !status.trim()) {
      const errorMessage = 'Error: Task status is required';
      console.error('SubagentTaskCompletedNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      SubagentTaskCompletedNotify(
        parentAgentId,
        subagentId,
        taskId,
        result,
        status
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send subagent task completed notification`;
      this.setOutputData(1, false);
      console.error('SubagentTaskCompletedNode error:', error);
    }
  }
}