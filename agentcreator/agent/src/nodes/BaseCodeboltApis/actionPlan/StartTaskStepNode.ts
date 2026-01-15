import { BaseStartTaskStepNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific StartTaskStep Node - actual implementation
export class StartTaskStepNode extends BaseStartTaskStepNode {
  constructor() {
    super();
  }

  async onExecute() {
    const planId = this.getInputData(1);
    const taskId = this.getInputData(2);

    if (!planId || typeof planId !== 'string' || !planId.trim()) {
      const errorMessage = 'Error: Plan ID cannot be empty';
      console.error('StartTaskStepNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (!taskId || typeof taskId !== 'string' || !taskId.trim()) {
      const errorMessage = 'Error: Task ID cannot be empty';
      console.error('StartTaskStepNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.actionPlan.startTaskStep(planId, taskId);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the taskStarted event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error starting task step: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('StartTaskStepNode error:', error);
    }
  }
}