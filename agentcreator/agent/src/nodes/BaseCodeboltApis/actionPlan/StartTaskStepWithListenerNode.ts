import { BaseStartTaskStepWithListenerNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { ActionPlanResponseType } from '@codebolt/types/enum';

// Backend-specific StartTaskStepWithListener Node - actual implementation
export class StartTaskStepWithListenerNode extends BaseStartTaskStepWithListenerNode {
  private cleanupFunction: (() => void) | null = null;

  constructor() {
    super();
  }

  async onExecute() {
    const planId = this.getInputData(1);
    const taskId = this.getInputData(2);

    // Clean up any existing listener
    if (this.cleanupFunction) {
      this.cleanupFunction();
      this.cleanupFunction = null;
    }

    if (!planId || typeof planId !== 'string' || !planId.trim()) {
      const errorMessage = 'Error: Plan ID cannot be empty';
      console.error('StartTaskStepWithListenerNode error:', errorMessage);
      this.setOutputData(4, false);
      this.setOutputData(3, null);
      this.setOutputData(2, null);
      return;
    }

    if (!taskId || typeof taskId !== 'string' || !taskId.trim()) {
      const errorMessage = 'Error: Task ID cannot be empty';
      console.error('StartTaskStepWithListenerNode error:', errorMessage);
      this.setOutputData(4, false);
      this.setOutputData(3, null);
      this.setOutputData(2, null);
      return;
    }

    try {
      // Define the response handler
      const onResponse = (response: any) => {
        // Set the response output
        this.setOutputData(3, response);

        // Trigger appropriate events based on response
        if (response.type === ActionPlanResponseType.START_TASK_STEP_RESPONSE) {
          this.triggerSlot(0, null, null); // taskStarted
        }
        // You could also trigger update events here based on response content
        this.triggerSlot(1, null, null); // onTaskUpdate

        // Check if task is completed based on response
        if (response.status === 'completed' || response.completed) {
          this.triggerSlot(2, null, null); // taskCompleted
        }
      };

      // Start the task step with listener
      this.cleanupFunction = codebolt.actionPlan.startTaskStepWithListener(planId, taskId, onResponse);

      // Set the cleanup function output
      this.setOutputData(2, this.cleanupFunction);
      this.setOutputData(4, true);

      // Trigger the initial task started event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error starting task step with listener: ${error}`;
      this.setOutputData(3, null);
      this.setOutputData(2, null);
      this.setOutputData(4, false);
      console.error('StartTaskStepWithListenerNode error:', error);
    }
  }

  // Clean up when node is destroyed
  onRemoved(): void {
    if (this.cleanupFunction) {
      this.cleanupFunction();
      this.cleanupFunction = null;
    }
    super.onRemoved();
  }
}