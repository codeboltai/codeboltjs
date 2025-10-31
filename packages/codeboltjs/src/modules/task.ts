import cbws from '../core/websocket';
import { randomUUID } from 'crypto';

// Import task event types from common/types package
import type {
    // Task event schemas
    CreateTaskEvent,
    GetTaskListEvent,
    AddStepToTaskEvent,
    GetTasksStartedByMeEvent,
    GetTaskDetailEvent,
    GetTaskMessagesEvent,
    SendSteeringMessageEvent,
    GetAllStepsEvent,
    GetCurrentRunningStepEvent,
    UpdateStepStatusEvent,
    CompleteStepEvent,
    UpdateTaskEvent,
    DeleteTaskEvent,
    CompleteTaskEvent,
    StartTaskEvent,
    CanTaskStartEvent,
    GetTasksDependentOnEvent,
    GetTasksReadyToStartEvent,
    GetTaskDependencyChainEvent,
    GetTaskStatsEvent,
    // Options types
    CreateTaskOptions,
    UpdateTaskOptions,
    GetTaskListOptions,
    AddStepToTaskOptions,
    GetTaskDetailOptions,
    GetTaskMessagesOptions,
    SendSteeringMessageOptions,
    GetAllStepsOptions,
    GetActiveStepOptions,
    UpdateStepStatusOptions,
    CompleteStepOptions,
    DeleteTaskOptions,
    CompleteTaskOptions,
    StartTaskOptions,
    CanTaskStartOptions,
    GetTasksDependentOnOptions,
    GetTasksReadyToStartOptions,
    GetTaskDependencyChainOptions,
    GetTaskStatsOptions,
    // Core types
    MessageData,
    Position,
    FlowData,
    Step
} from '@codebolt/types/agent-to-app-ws-schema';

// Import response types
import type {
    TaskResponse,
    TaskListResponse,
    StepResponse,
    StepListResponse,
    TaskMessagesResponse,
    ActiveStepResponse,
    SendSteeringMessageResponse,
    DeleteTaskResponse,
    CanTaskStartResponse,
    TaskStatsResponse,
    CreateTaskResponse,
    GetTaskListResponse,
    AddStepToTaskResponse,
    GetTaskDetailResponse,
    GetTaskMessagesResponse,
    GetAllStepsResponse,
    GetCurrentRunningStepResponse,
    UpdateStepStatusResponse,
    CompleteStepResponse,
    UpdateTaskResponse,
    CompleteTaskResponse,
    StartTaskResponse,
    GetTasksDependentOnResponse,
    GetTasksReadyToStartResponse,
    GetTaskDependencyChainResponse,
    GetTaskStatsResponse,
    Task,
    ExtendedTask,
    ExtendedStep,
    TaskMessage,
    TaskStats,
    TaskResponseMessageData as ResponseMessageData
} from '@codebolt/types/app-to-agent-ws-schema';

// Import legacy types for backward compatibility
import type { 
    Task as LegacyTask, 
    SubTask as LegacySubTask, 
    TaskResponse as LegacyTaskResponse,
    TaskCreateOptions as LegacyTaskCreateOptions,
    TaskUpdateOptions as LegacyTaskUpdateOptions,
    AddSubTaskOptions,
    UpdateSubTaskOptions,
    TaskFilterOptions,
    TaskMarkdownImportOptions,
    TaskMarkdownExportOptions,
} from '../types';

/**
 * Enhanced task service with comprehensive task and step management.
 * This module provides a modern API for task management based on the new task service schemas.
 */
const taskService = {
    /**
     * Creates a new task with comprehensive options.
     * @param {CreateTaskOptions} options - The task creation parameters
     * @returns {Promise<CreateTaskResponse>} A promise that resolves with the task creation response
     */
    createTask: async (options: CreateTaskOptions): Promise<CreateTaskResponse> => {
        const requestId = randomUUID();
        
        const event: CreateTaskEvent = {
            type: 'taskEvent',
            action: 'createTask',
            requestId,
            agentId: options.threadId, // Using threadId as agentId for now
            threadId: options.threadId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'createTaskResponse'
        );
    },

    /**
     * Creates a simple task with minimal parameters (legacy compatibility).
     * @param {string} taskName - The task name
     * @param {string} threadId - The thread ID (defaults to 'default-thread')
     * @returns {Promise<CreateTaskResponse>} A promise that resolves with the task creation response
     */
    createSimpleTask: async (taskName: string, threadId: string = 'default-thread'): Promise<CreateTaskResponse> => {
        const options: CreateTaskOptions = {
            threadId,
            name: taskName,
            taskType: 'interactive',
            executionType: 'manual',
            environmentType: 'local',
            startOption: 'manual'
        };
        
        return taskService.createTask(options);
    },

    /**
     * Retrieves a list of tasks with optional filtering.
     * @param {GetTaskListOptions} options - Optional filters for tasks
     * @returns {Promise<GetTaskListResponse>} A promise that resolves with the task list response
     */
    getTaskList: async (options: GetTaskListOptions = {}): Promise<GetTaskListResponse> => {
        const requestId = randomUUID();
        
        const event: GetTaskListEvent = {
            type: 'taskEvent',
            action: 'getTaskList',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTaskListResponse'
        );
    },
    
    /**
     * Retrieves detailed information about a specific task.
     * @param {GetTaskDetailOptions} options - The task detail options
     * @returns {Promise<GetTaskDetailResponse>} A promise that resolves with the task detail response
     */
    getTaskDetail: async (options: GetTaskDetailOptions): Promise<GetTaskDetailResponse> => {
        const requestId = randomUUID();
        
        const event: GetTaskDetailEvent = {
            type: 'taskEvent',
            action: 'getTaskDetail',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTaskDetailResponse'
        );
    },

    /**
     * Adds a step to an existing task.
     * @param {AddStepToTaskOptions} options - The step addition options
     * @returns {Promise<AddStepToTaskResponse>} A promise that resolves with the step addition response
     */
    addStepToTask: async (options: AddStepToTaskOptions): Promise<AddStepToTaskResponse> => {
        const requestId = randomUUID();
        
        const event: AddStepToTaskEvent = {
            type: 'taskEvent',
            action: 'addStepToTask',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'addStepToTaskResponse'
        );
    },

    /**
     * Retrieves messages for a specific task.
     * @param {GetTaskMessagesOptions} options - The task messages options
     * @returns {Promise<GetTaskMessagesResponse>} A promise that resolves with the task messages response
     */
    getTaskMessages: async (options: GetTaskMessagesOptions): Promise<GetTaskMessagesResponse> => {
        const requestId = randomUUID();
        
        const event: GetTaskMessagesEvent = {
            type: 'taskEvent',
            action: 'getTaskMessages',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTaskMessagesResponse'
        );
    },

    /**
     * Updates an existing task.
     * @param {string} taskId - The task ID to update
     * @param {UpdateTaskOptions} updates - The task update parameters
     * @returns {Promise<UpdateTaskResponse>} A promise that resolves with the task update response
     */
    updateTask: async (taskId: string, updates: UpdateTaskOptions): Promise<UpdateTaskResponse> => {
        const requestId = randomUUID();
        
        const event: UpdateTaskEvent = {
            type: 'taskEvent',
            action: 'updateTask',
            requestId,
            message: {
                taskId,
                ...updates
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'updateTaskResponse'
        );
    },

    /**
     * Updates a task with simple name change (legacy compatibility).
     * @param {string} taskId - The task ID
     * @param {string} taskName - The new task name
     * @returns {Promise<UpdateTaskResponse>} A promise that resolves with the task update response
     */
    updateSimpleTask: async (taskId: string, taskName: string): Promise<UpdateTaskResponse> => {
        return taskService.updateTask(taskId, {
            name: taskName
        });
    },

    /**
     * Deletes a task.
     * @param {string} taskId - The task ID to delete
     * @returns {Promise<DeleteTaskResponse>} A promise that resolves with the task deletion response
     */
    deleteTask: async (taskId: string): Promise<DeleteTaskResponse> => {
        const requestId = randomUUID();
        
        const event: DeleteTaskEvent = {
            type: 'taskEvent',
            action: 'deleteTask',
            requestId,
            message: {
                taskId
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'deleteTaskResponse'
        );
    },

    /**
     * Completes a task.
     * @param {string} taskId - The task ID to complete
     * @returns {Promise<CompleteTaskResponse>} A promise that resolves with the task completion response
     */
    completeTask: async (taskId: string): Promise<CompleteTaskResponse> => {
        const requestId = randomUUID();
        
        const event: CompleteTaskEvent = {
            type: 'taskEvent',
            action: 'completeTask',
            requestId,
            message: {
                taskId
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'completeTaskResponse'
        );
    },

    /**
     * Starts a task.
     * @param {string} taskId - The task ID to start
     * @returns {Promise<StartTaskResponse>} A promise that resolves with the task start response
     */
    startTask: async (taskId: string): Promise<StartTaskResponse> => {
        const requestId = randomUUID();
        
        const event: StartTaskEvent = {
            type: 'taskEvent',
            action: 'startTask',
            requestId,
            message: {
                taskId
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'startTaskResponse'
        );
    },

    /**
     * Retrieves all steps with optional filtering.
     * @param {GetAllStepsOptions} options - Optional filters for steps
     * @returns {Promise<GetAllStepsResponse>} A promise that resolves with the steps response
     */
    getAllSteps: async (options: GetAllStepsOptions = {}): Promise<GetAllStepsResponse> => {
        const requestId = randomUUID();
        
        const event: GetAllStepsEvent = {
            type: 'taskEvent',
            action: 'getAllSteps',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getAllStepsResponse'
        );
    },

    /**
     * Gets the currently running step for a task or agent.
     * @param {GetActiveStepOptions} options - Options for getting active step
     * @returns {Promise<GetCurrentRunningStepResponse>} A promise that resolves with the active step response
     */
    getCurrentRunningStep: async (options: GetActiveStepOptions = {}): Promise<GetCurrentRunningStepResponse> => {
        const requestId = randomUUID();
        
        const event: GetCurrentRunningStepEvent = {
            type: 'taskEvent',
            action: 'getCurrentRunningStep',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getCurrentRunningStepResponse'
        );
    },

    /**
     * Updates the status of a specific step.
     * @param {UpdateStepStatusOptions} options - The step status update options
     * @returns {Promise<UpdateStepStatusResponse>} A promise that resolves with the step update response
     */
    updateStepStatus: async (options: UpdateStepStatusOptions): Promise<UpdateStepStatusResponse> => {
        const requestId = randomUUID();
        
        const event: UpdateStepStatusEvent = {
            type: 'taskEvent',
            action: 'updateStepStatus',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'updateStepStatusResponse'
        );
    },

    /**
     * Completes a specific step.
     * @param {CompleteStepOptions} options - The step completion options
     * @returns {Promise<CompleteStepResponse>} A promise that resolves with the step completion response
     */
    completeStep: async (options: CompleteStepOptions): Promise<CompleteStepResponse> => {
        const requestId = randomUUID();
        
        const event: CompleteStepEvent = {
            type: 'taskEvent',
            action: 'completeStep',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'completeStepResponse'
        );
    },

    /**
     * Sends a steering message to a running step.
     * @param {SendSteeringMessageOptions} options - The steering message options
     * @returns {Promise<SendSteeringMessageResponse>} A promise that resolves with the steering message response
     */
    sendSteeringMessage: async (options: SendSteeringMessageOptions): Promise<SendSteeringMessageResponse> => {
        const requestId = randomUUID();
        
        const event: SendSteeringMessageEvent = {
            type: 'taskEvent',
            action: 'sendSteeringMessage',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'sendSteeringMessageResponse'
        );
    },

    /**
     * Checks if a task can start based on its dependencies.
     * @param {string} taskId - The task ID to check
     * @returns {Promise<CanTaskStartResponse>} A promise that resolves with the task start capability response
     */
    canTaskStart: async (taskId: string): Promise<CanTaskStartResponse> => {
        const requestId = randomUUID();
        
        const event: CanTaskStartEvent = {
            type: 'taskEvent',
            action: 'canTaskStart',
            requestId,
            message: {
                taskId
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'canTaskStartResponse'
        );
    },

    /**
     * Gets tasks that depend on a specific task.
     * @param {string} taskId - The task ID to check dependencies for
     * @returns {Promise<GetTasksDependentOnResponse>} A promise that resolves with the dependent tasks response
     */
    getTasksDependentOn: async (taskId: string): Promise<GetTasksDependentOnResponse> => {
        const requestId = randomUUID();
        
        const event: GetTasksDependentOnEvent = {
            type: 'taskEvent',
            action: 'getTasksDependentOn',
            requestId,
            message: {
                taskId
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTasksDependentOnResponse'
        );
    },

    /**
     * Gets tasks that are ready to start.
     * @param {GetTasksReadyToStartOptions} options - Optional filters for ready tasks
     * @returns {Promise<GetTasksReadyToStartResponse>} A promise that resolves with the ready tasks response
     */
    getTasksReadyToStart: async (options: GetTasksReadyToStartOptions = {}): Promise<GetTasksReadyToStartResponse> => {
        const requestId = randomUUID();
        
        const event: GetTasksReadyToStartEvent = {
            type: 'taskEvent',
            action: 'getTasksReadyToStart',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTasksReadyToStartResponse'
        );
    },

    /**
     * Gets the dependency chain for a specific task.
     * @param {string} taskId - The task ID to get dependency chain for
     * @returns {Promise<GetTaskDependencyChainResponse>} A promise that resolves with the dependency chain response
     */
    getTaskDependencyChain: async (taskId: string): Promise<GetTaskDependencyChainResponse> => {
        const requestId = randomUUID();
        
        const event: GetTaskDependencyChainEvent = {
            type: 'taskEvent',
            action: 'getTaskDependencyChain',
            requestId,
            message: {
                taskId
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTaskDependencyChainResponse'
        );
    },

    /**
     * Gets task statistics.
     * @param {GetTaskStatsOptions} options - Optional filters for task stats
     * @returns {Promise<GetTaskStatsResponse>} A promise that resolves with the task stats response
     */
    getTaskStats: async (options: GetTaskStatsOptions = {}): Promise<GetTaskStatsResponse> => {
        const requestId = randomUUID();
        
        const event: GetTaskStatsEvent = {
            type: 'taskEvent',
            action: 'getTaskStats',
            requestId,
            message: options
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTaskStatsResponse'
        );
    },


    // ================================
    // Utility Functions
    // ================================

    /**
     * Utility function to toggle task completion status.
     * @param {string} taskId - The task ID
     * @param {boolean} completed - The new completion status
     * @returns {Promise<UpdateTaskResponse>} A promise that resolves with the task update response
     */
    toggleTaskCompletion: async (taskId: string, completed: boolean): Promise<UpdateTaskResponse> => {
        return taskService.updateTask(taskId, {
            completed: completed
        });
    },

    /**
     * Utility function to create a quick task with minimal parameters.
     * @param {string} name - The task name
     * @param {string} threadId - The thread ID (defaults to 'default-thread')
     * @returns {Promise<CreateTaskResponse>} A promise that resolves with the task creation response
     */
    createQuickTask: async (name: string, threadId: string = 'default-thread'): Promise<CreateTaskResponse> => {
        return taskService.createTask({
            threadId,
            name,
            taskType: 'interactive',
            executionType: 'immediate',
            environmentType: 'local',
            startOption: 'immediately'
        });
    },

    /**
     * Gets tasks started by a specific user
     * @param {string} userId - The user ID
     * @param {GetTaskListOptions} options - Optional filters for tasks
     * @returns {Promise<GetTaskListResponse>} A promise that resolves with the task list response
     */
    getTasksStartedByMe: async (userId: string, options: GetTaskListOptions = {}): Promise<GetTaskListResponse> => {
        const requestId = randomUUID();
        
        const event: GetTasksStartedByMeEvent = {
            type: 'taskEvent',
            action: 'getTasksStartedByMe',
            requestId,
            message: {
                userId,
                ...options
            }
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTasksStartedByMeResponse'
        );
    },

    // ================================
    // Legacy Compatibility Functions
    // ================================

    /**
     * Legacy function: Adds a task (mapped to createTask)
     * @deprecated Use createTask instead
     */
    addTask: async (params: LegacyTaskCreateOptions): Promise<CreateTaskResponse> => {
        const options: CreateTaskOptions = {
            threadId: params.agentId || 'default-thread',
            name: params.title,
            taskType: 'interactive',
            executionType: 'manual',
            environmentType: 'local',
            startOption: 'manual'
        };
        
        return taskService.createTask(options);
    },

    /**
     * Legacy function: Gets tasks (mapped to getTaskList)
     * @deprecated Use getTaskList instead
     */
    getTasks: async (filters: TaskFilterOptions = {}): Promise<GetTaskListResponse> => {
        const options: GetTaskListOptions = {
            threadId: filters.agentId,
            status: 'all'
        };
        
        return taskService.getTaskList(options);
    },

    /**
     * Legacy function: Gets tasks by agent (mapped to getTaskList with threadId filter)
     * @deprecated Use getTaskList with threadId filter instead
     */
    getTasksByAgent: async (agentId: string): Promise<GetTaskListResponse> => {
        return taskService.getTaskList({
            threadId: agentId
        });
    },

    /**
     * Legacy function: Gets tasks by category (use getTaskList with custom filtering)
     * @deprecated Use getTaskList instead
     */
    getTasksByCategory: async (category: string): Promise<GetTaskListResponse> => {
        // Note: The new API doesn't have category filtering built-in
        // This would need to be implemented as post-processing
        return taskService.getTaskList();
    },
    attachJsonMemoryToTask:(taskId:string,memoryId:string)=>{
        const requestId = randomUUID();
        const event = {
            type: 'taskEvent',
            action: 'attachJsonMemoryToTask',
            requestId,
            taskId,
            memoryId
            
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'attachJsonMemoryToTaskResponse'
        );
    },
    attachMarktownMemoryJToTask:(taskId:string,memoryId:string)=>{
        const requestId = randomUUID();
        const event = {
            type: 'taskEvent',
            action: 'attachMarktownMemoryJToTask',
            requestId,
            taskId,
            memoryId
            
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'attachJsonMemoryToTaskResponse'
        );
    },
    attachToDoToTask:(taskId:string,todoId:string)=>{
        const requestId = randomUUID();
        const event = {
            type: 'taskEvent',
            action: 'attachToDoToTask',
            requestId,
            taskId,
            todoId
        };
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'attachToDoToTaskResponse'
        );
    },
    getAttachedTodos:(taskId:string)=>{
        const requestId = randomUUID();
        const event = {
            type: 'taskEvent',
            action: 'attachToDoToTask',
            requestId,
            taskId,
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'attachToDoToTaskResponse'
        );
    },
    getAttachedJsonMemory:(taskId:string)=>{
        const requestId = randomUUID();
        const event = {
            type: 'taskEvent',
            action: 'getAttachedJsonMemory',
            requestId,
            taskId,
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getAttachedJsonMemoryResponse'
        );
    },
    getAttachedMarkdownMemory:(taskId:string)=>{
        const requestId = randomUUID();
        const event = {
            type: 'taskEvent',
            action: 'getAttachedMarkdownMemory',
            requestId,
            taskId,
        };
        
        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getAttachedMarkdownMemoryResponse'
        );
    }
};

// ================================
// Type Exports
// ================================

// Export new types
export type {
    // New task service types
    Task,
    ExtendedTask,
    Step,
    ExtendedStep,
    TaskMessage,
    MessageData,
    ResponseMessageData,
    TaskStats,
    CreateTaskOptions,
    UpdateTaskOptions,
    GetTaskListOptions,
    AddStepToTaskOptions,
    GetTaskDetailOptions,
    GetTaskMessagesOptions,
    UpdateStepStatusOptions,
    CompleteStepOptions,
    SendSteeringMessageOptions,
    GetAllStepsOptions,
    GetActiveStepOptions,
    DeleteTaskOptions,
    CompleteTaskOptions,
    StartTaskOptions,
    CanTaskStartOptions,
    GetTasksDependentOnOptions,
    GetTasksReadyToStartOptions,
    GetTaskDependencyChainOptions,
    GetTaskStatsOptions,
    // Response types
    TaskResponse,
    TaskListResponse,
    StepResponse,
    StepListResponse,
    TaskMessagesResponse,
    ActiveStepResponse,
    SendSteeringMessageResponse,
    DeleteTaskResponse,
    CanTaskStartResponse,
    TaskStatsResponse,
    CreateTaskResponse,
    GetTaskListResponse,
    AddStepToTaskResponse,
    GetTaskDetailResponse,
    GetTaskMessagesResponse,
    GetAllStepsResponse,
    GetCurrentRunningStepResponse,
    UpdateStepStatusResponse,
    CompleteStepResponse,
    UpdateTaskResponse,
    CompleteTaskResponse,
    StartTaskResponse,
    GetTasksDependentOnResponse,
    GetTasksReadyToStartResponse,
    GetTaskDependencyChainResponse,
    GetTaskStatsResponse,
    // Core utility types
    Position,
    FlowData
};

// Export legacy types for backward compatibility
export type {
    LegacyTask as Task_Legacy,
    LegacySubTask as SubTask,
    LegacyTaskResponse as TaskResponse_Legacy,
    LegacyTaskCreateOptions as TaskCreateOptions_Legacy,
    LegacyTaskUpdateOptions as TaskUpdateOptions_Legacy,
    AddSubTaskOptions,
    UpdateSubTaskOptions,
    TaskFilterOptions,
    TaskMarkdownImportOptions,
    TaskMarkdownExportOptions
};

export default taskService;
