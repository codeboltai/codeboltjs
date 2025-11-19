import {
  BaseDeleteTaskNode,
  BaseUpdateTaskNode,
  BaseGetTaskDetailNode,
  BaseAddStepToTaskNode,
  BaseGetTaskMessagesNode,
  BaseGetAllStepsNode,
  BaseGetCurrentRunningStepNode,
  BaseUpdateStepStatusNode,
  BaseCompleteStepNode,
  BaseSendSteeringMessageNode,
  BaseCanTaskStartNode,
  BaseGetTasksDependentOnNode,
  BaseGetTasksReadyToStartNode,
  BaseGetTaskDependencyChainNode,
  BaseGetTaskStatsNode,
  BaseGetTasksStartedByMeNode,
  BaseAttachMemoryToTaskNode,
  BaseGetAttachedMemoryForTaskNode,
  BaseCreateTaskGroupNode
} from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { normalizeTaskStatus, TaskStatus } from './statusHelpers.js';

// Backend-specific DeleteTask Node - actual implementation
export class DeleteTaskNode extends BaseDeleteTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('DeleteTaskNode error: taskId is required');
      this.setOutputData(1, false);
      return;
    }

    try {
      const result = await codebolt.task.deleteTask(taskId);

      // Update outputs with success results
      this.setOutputData(1, true); // success output

      // Trigger the taskDeleted event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to delete task`;
      this.setOutputData(1, false); // success output
      console.error('DeleteTaskNode error:', error);
    }
  }
}

// Backend-specific UpdateTask Node - actual implementation
export class UpdateTaskNode extends BaseUpdateTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);
    const updates: any = this.getInputData(2);

    if (!taskId) {
      console.error('UpdateTaskNode error: taskId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await codebolt.task.updateTask(taskId, updates || {});

      // Update outputs with success results
      this.setOutputData(1, result); // task output
      this.setOutputData(2, true); // success output

      // Trigger the taskUpdated event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to update task`;
      this.setOutputData(1, null); // task output
      this.setOutputData(2, false); // success output
      console.error('UpdateTaskNode error:', error);
    }
  }
}

// Backend-specific GetTaskDetail Node - actual implementation
export class GetTaskDetailNode extends BaseGetTaskDetailNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('GetTaskDetailNode error: taskId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await codebolt.task.getTaskDetail({ taskId });

      // Update outputs with success results
      this.setOutputData(1, result); // task output
      this.setOutputData(2, true); // success output

      // Trigger the taskDetailRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get task detail`;
      this.setOutputData(1, null); // task output
      this.setOutputData(2, false); // success output
      console.error('GetTaskDetailNode error:', error);
    }
  }
}

// Backend-specific AddStepToTask Node - actual implementation
export class AddStepToTaskNode extends BaseAddStepToTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);
    const stepData: any = this.getInputData(2);

    if (!taskId || !stepData) {
      console.error('AddStepToTaskNode error: taskId and stepData are required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const options = { taskId, ...stepData };
      const result = await codebolt.task.addStepToTask(options);

      // Update outputs with success results
      this.setOutputData(1, result); // step output
      this.setOutputData(2, true); // success output

      // Trigger the stepAdded event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to add step to task`;
      this.setOutputData(1, null); // step output
      this.setOutputData(2, false); // success output
      console.error('AddStepToTaskNode error:', error);
    }
  }
}

// Backend-specific GetTaskMessages Node - actual implementation
export class GetTaskMessagesNode extends BaseGetTaskMessagesNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('GetTaskMessagesNode error: taskId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result: any = await codebolt.task.getTaskMessages({ taskId });

      // Update outputs with success results
      const messages = Array.isArray(result?.messages)
        ? result.messages
        : Array.isArray(result?.data?.messages)
          ? result.data.messages
          : [];
      this.setOutputData(1, messages); // messages output
      this.setOutputData(2, true); // success output

      // Trigger the messagesRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get task messages`;
      this.setOutputData(1, []); // messages output
      this.setOutputData(2, false); // success output
      console.error('GetTaskMessagesNode error:', error);
    }
  }
}

// Backend-specific GetAllSteps Node - actual implementation
export class GetAllStepsNode extends BaseGetAllStepsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);
    const status: any = this.getInputData(2);

    const options: { taskId?: string; status?: TaskStatus } = {};
    if (typeof taskId === 'string' && taskId.trim()) options.taskId = taskId.trim();
    const normalizedStatus = normalizeTaskStatus(status);
    if (normalizedStatus) options.status = normalizedStatus;

    try {
      const result: any = await codebolt.task.getAllSteps(options);

      // Update outputs with success results
      this.setOutputData(1, (result?.steps ?? []) as any); // steps output
      this.setOutputData(2, true); // success output

      // Trigger the stepsRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get all steps`;
      this.setOutputData(1, []); // steps output
      this.setOutputData(2, false); // success output
      console.error('GetAllStepsNode error:', error);
    }
  }
}

// Backend-specific GetCurrentRunningStep Node - actual implementation
export class GetCurrentRunningStepNode extends BaseGetCurrentRunningStepNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);
    const agentId: any = this.getInputData(2);

    const options: { taskId?: string; agentId?: string } = {};
    if (typeof taskId === 'string' && taskId.trim()) options.taskId = taskId.trim();
    if (typeof agentId === 'string' && agentId.trim()) options.agentId = agentId.trim();

    try {
      const result: any = await codebolt.task.getCurrentRunningStep(options);

      // Update outputs with success results
      this.setOutputData(1, result); // step output
      this.setOutputData(2, true); // success output

      // Trigger the currentStepRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get current running step`;
      this.setOutputData(1, null); // step output
      this.setOutputData(2, false); // success output
      console.error('GetCurrentRunningStepNode error:', error);
    }
  }
}

// Backend-specific UpdateStepStatus Node - actual implementation
export class UpdateStepStatusNode extends BaseUpdateStepStatusNode {
  constructor() {
    super();
  }

  async onExecute() {
    const stepId: any = this.getInputData(1);
    const status: any = this.getInputData(2);
    const taskId: any = this.getInputData(3);

    if (!stepId || !status) {
      console.error('UpdateStepStatusNode error: stepId and status are required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const options = { stepId, status, taskId };
      const result = await codebolt.task.updateStepStatus(options);

      // Update outputs with success results
      this.setOutputData(1, result); // step output
      this.setOutputData(2, true); // success output

      // Trigger the stepStatusUpdated event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to update step status`;
      this.setOutputData(1, null); // step output
      this.setOutputData(2, false); // success output
      console.error('UpdateStepStatusNode error:', error);
    }
  }
}

// Backend-specific CompleteStep Node - actual implementation
export class CompleteStepNode extends BaseCompleteStepNode {
  constructor() {
    super();
  }

  async onExecute() {
    const stepId: any = this.getInputData(1);
    const taskId: any = this.getInputData(2);
    const result: any = this.getInputData(3);

    if (!stepId) {
      console.error('CompleteStepNode error: stepId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const options = { stepId, taskId, result };
      const response = await codebolt.task.completeStep(options);

      // Update outputs with success results
      this.setOutputData(1, response); // step output
      this.setOutputData(2, true); // success output

      // Trigger the stepCompleted event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to complete step`;
      this.setOutputData(1, null); // step output
      this.setOutputData(2, false); // success output
      console.error('CompleteStepNode error:', error);
    }
  }
}

// Backend-specific SendSteeringMessage Node - actual implementation
export class SendSteeringMessageNode extends BaseSendSteeringMessageNode {
  constructor() {
    super();
  }

  async onExecute() {
    const stepId: any = this.getInputData(1);
    const message: any = this.getInputData(2);
    const messageType: any = this.getInputData(3);

    if (!stepId || !message) {
      console.error('SendSteeringMessageNode error: stepId and message are required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const options = { stepId, message, messageType };
      const response = await codebolt.task.sendSteeringMessage(options);

      // Update outputs with success results
      this.setOutputData(1, response); // response output
      this.setOutputData(2, true); // success output

      // Trigger the steeringMessageSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send steering message`;
      this.setOutputData(1, null); // response output
      this.setOutputData(2, false); // success output
      console.error('SendSteeringMessageNode error:', error);
    }
  }
}

// Backend-specific CanTaskStart Node - actual implementation
export class CanTaskStartNode extends BaseCanTaskStartNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('CanTaskStartNode error: taskId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result: any = await codebolt.task.canTaskStart(taskId);

      // Update outputs with success results
      this.setOutputData(1, !!result?.canStart); // canStart output
      this.setOutputData(2, true); // success output

      // Trigger the canStartChecked event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to check if task can start`;
      this.setOutputData(1, false); // canStart output
      this.setOutputData(2, false); // success output
      console.error('CanTaskStartNode error:', error);
    }
  }
}

// Backend-specific GetTasksDependentOn Node - actual implementation
export class GetTasksDependentOnNode extends BaseGetTasksDependentOnNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('GetTasksDependentOnNode error: taskId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result: any = await codebolt.task.getTasksDependentOn(taskId);

      // Update outputs with success results
      this.setOutputData(1, (result?.tasks ?? []) as any); // tasks output
      this.setOutputData(2, true); // success output

      // Trigger the dependentTasksRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get tasks dependent on`;
      this.setOutputData(1, []); // tasks output
      this.setOutputData(2, false); // success output
      console.error('GetTasksDependentOnNode error:', error);
    }
  }
}

// Backend-specific GetTasksReadyToStart Node - actual implementation
export class GetTasksReadyToStartNode extends BaseGetTasksReadyToStartNode {
  constructor() {
    super();
  }

  async onExecute() {
    const threadId: any = this.getInputData(1);
    const environmentType: any = this.getInputData(2);

    const options: { threadId?: string; environmentType?: string } = {};
    if (typeof threadId === 'string' && threadId.trim()) options.threadId = threadId.trim();
    if (typeof environmentType === 'string' && environmentType.trim()) options.environmentType = environmentType.trim();

    try {
      const result: any = await codebolt.task.getTasksReadyToStart(options);

      // Update outputs with success results
      this.setOutputData(1, (result?.tasks ?? []) as any); // tasks output
      this.setOutputData(2, true); // success output

      // Trigger the readyTasksRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get tasks ready to start`;
      this.setOutputData(1, []); // tasks output
      this.setOutputData(2, false); // success output
      console.error('GetTasksReadyToStartNode error:', error);
    }
  }
}

// Backend-specific GetTaskDependencyChain Node - actual implementation
export class GetTaskDependencyChainNode extends BaseGetTaskDependencyChainNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('GetTaskDependencyChainNode error: taskId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result: any = await codebolt.task.getTaskDependencyChain(taskId);

      // Update outputs with success results
      this.setOutputData(1, (result?.chain ?? []) as any); // chain output
      this.setOutputData(2, true); // success output

      // Trigger the dependencyChainRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get task dependency chain`;
      this.setOutputData(1, []); // chain output
      this.setOutputData(2, false); // success output
      console.error('GetTaskDependencyChainNode error:', error);
    }
  }
}

// Backend-specific GetTaskStats Node - actual implementation
export class GetTaskStatsNode extends BaseGetTaskStatsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const threadId: any = this.getInputData(1);
    const timeRange: any = this.getInputData(2);

    const options: { threadId?: string; timeRange?: string } = {};
    if (typeof threadId === 'string' && threadId.trim()) options.threadId = threadId.trim();
    if (typeof timeRange === 'string' && timeRange.trim()) options.timeRange = timeRange.trim();

    try {
      const result: any = await codebolt.task.getTaskStats(options);

      // Update outputs with success results
      this.setOutputData(1, result); // stats output
      this.setOutputData(2, true); // success output

      // Trigger the statsRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get task stats`;
      this.setOutputData(1, null); // stats output
      this.setOutputData(2, false); // success output
      console.error('GetTaskStatsNode error:', error);
    }
  }
}

// Backend-specific GetTasksStartedByMe Node - actual implementation
export class GetTasksStartedByMeNode extends BaseGetTasksStartedByMeNode {
  constructor() {
    super();
  }

  async onExecute() {
    const userId: any = this.getInputData(1);
    const status: any = this.getInputData(2);

    if (!userId) {
      console.error('GetTasksStartedByMeNode error: userId is required');
      this.setOutputData(2, false);
      return;
    }

    const filters: { status?: TaskStatus } = {};
    const normalizedStatus = normalizeTaskStatus(status);
    if (normalizedStatus) filters.status = normalizedStatus;

    try {
      const result: any = await codebolt.task.getTasksStartedByMe(userId, filters);

      // Update outputs with success results
      this.setOutputData(1, (result?.tasks ?? []) as any); // tasks output
      this.setOutputData(2, true); // success output

      // Trigger the tasksRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get tasks started by user`;
      this.setOutputData(1, []); // tasks output
      this.setOutputData(2, false); // success output
      console.error('GetTasksStartedByMeNode error:', error);
    }
  }
}

// Backend-specific AttachMemoryToTask Node - actual implementation
export class AttachMemoryToTaskNode extends BaseAttachMemoryToTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);
    const memoryId: any = this.getInputData(2);

    if (!taskId || !memoryId) {
      console.error('AttachMemoryToTaskNode error: taskId and memoryId are required');
      this.setOutputData(1, false);
      return;
    }

    try {
      const result = await codebolt.task.attachMemoryToTask(taskId, memoryId);

      // Update outputs with success results
      this.setOutputData(1, true); // success output

      // Trigger the memoryAttached event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to attach memory to task`;
      this.setOutputData(1, false); // success output
      console.error('AttachMemoryToTaskNode error:', error);
    }
  }
}

// Backend-specific GetAttachedMemoryForTask Node - actual implementation
export class GetAttachedMemoryForTaskNode extends BaseGetAttachedMemoryForTaskNode {
  constructor() {
    super();
  }

  async onExecute() {
    const taskId: any = this.getInputData(1);

    if (!taskId) {
      console.error('GetAttachedMemoryForTaskNode error: taskId is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await codebolt.task.getAttachedMemoryForTask(taskId);

      // Update outputs with success results
      this.setOutputData(1, result.memory || []); // memory output
      this.setOutputData(2, true); // success output

      // Trigger the memoryRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get attached memory for task`;
      this.setOutputData(1, []); // memory output
      this.setOutputData(2, false); // success output
      console.error('GetAttachedMemoryForTaskNode error:', error);
    }
  }
}

// Backend-specific CreateTaskGroup Node - actual implementation
export class CreateTaskGroupNode extends BaseCreateTaskGroupNode {
  constructor() {
    super();
  }

  async onExecute() {
    const groupName: any = this.getInputData(1);
    const description: any = this.getInputData(2);

    if (!groupName) {
      console.error('CreateTaskGroupNode error: groupName is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await codebolt.task.createTaskGroup(groupName, description || "");

      // Update outputs with success results
      this.setOutputData(1, result); // taskGroup output
      this.setOutputData(2, true); // success output

      // Trigger the taskGroupCreated event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to create task group`;
      this.setOutputData(1, null); // taskGroup output
      this.setOutputData(2, false); // success output
      console.error('CreateTaskGroupNode error:', error);
    }
  }
}