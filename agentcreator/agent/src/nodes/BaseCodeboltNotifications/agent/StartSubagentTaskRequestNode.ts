import { BaseStartSubagentTaskRequestNode } from '@agent-creator/shared-nodes';
import { StartSubagentTaskRequestNotify } from '@codebolt/codeboltjs';

// Backend StartSubagentTaskRequestNode - actual implementation
export class StartSubagentTaskRequestNode extends BaseStartSubagentTaskRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const parentAgentId: any = this.getInputData(1);
    const subagentId: any = this.getInputData(2);
    const task: any = this.getInputData(3);
    const priority: any = this.getInputData(4);
    const dependencies: any = this.getInputData(5);

    // Validate required inputs
    if (!parentAgentId || typeof parentAgentId !== 'string' || !parentAgentId.trim()) {
      const errorMessage = 'Error: Parent Agent ID is required';
      console.error('StartSubagentTaskRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!subagentId || typeof subagentId !== 'string' || !subagentId.trim()) {
      const errorMessage = 'Error: Subagent ID is required';
      console.error('StartSubagentTaskRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!task || typeof task !== 'string' || !task.trim()) {
      const errorMessage = 'Error: Task description is required';
      console.error('StartSubagentTaskRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      StartSubagentTaskRequestNotify(
        parentAgentId,
        subagentId,
        task,
        priority,
        dependencies
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send start subagent task request`;
      this.setOutputData(1, false);
      console.error('StartSubagentTaskRequestNode error:', error);
    }
  }
}