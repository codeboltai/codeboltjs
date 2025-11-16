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

    const normalizedName = typeof name === 'string' && name.trim() ? name.trim() : 'Unnamed Task';
    const normalizedThreadId = typeof threadId === 'string' && threadId.trim() ? threadId.trim() : 'default-thread';

    const allowedTaskTypes: Array<'interactive' | 'scheduled'> = ['interactive', 'scheduled'];
    const normalizedTaskType: 'interactive' | 'scheduled' = allowedTaskTypes.includes(taskType)
      ? taskType
      : 'interactive';

    const allowedExecutionTypes: Array<'manual' | 'scheduled' | 'immediate' | 'conditional'> = [
      'manual',
      'scheduled',
      'immediate',
      'conditional'
    ];
    const normalizedExecutionType: 'manual' | 'scheduled' | 'immediate' | 'conditional' = allowedExecutionTypes.includes(executionType)
      ? executionType
      : 'manual';

    const options = {
      name: normalizedName,
      threadId: normalizedThreadId,
      taskType: normalizedTaskType,
      executionType: normalizedExecutionType,
      environmentType: 'local' as const,
      startOption: 'manual' as const
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