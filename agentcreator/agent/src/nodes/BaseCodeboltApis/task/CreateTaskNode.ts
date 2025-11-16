import { BaseCreateTaskNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CreateTask Node - actual implementation
export class CreateTaskNode extends BaseCreateTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const name: any = this.getInputData(1);
    const threadId: any = this.getInputData(2);
    const taskType: any = this.getInputData(3);
    const executionType: any = this.getInputData(4);

    const options = {
      name: name || "Unnamed Task",
      threadId: threadId || "default-thread",
      taskType: taskType || "interactive",
      executionType: executionType || "manual",
      environmentType: "local",
      startOption: "manual"
    };

    try {
      const result = await codebolt.task.createTask(options);

      // Update outputs with success results
      this.setOutputData(1, result); // task output
      this.setOutputData(2, true); // success output

      // Trigger the taskCreated event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to create task`;
      this.setOutputData(1, null); // task output
      this.setOutputData(2, false); // success output
      console.error('CreateTaskNode error:', error);
    }
  }
}