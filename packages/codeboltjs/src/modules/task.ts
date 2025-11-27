import cbws from '../core/websocket';
import { randomUUID } from 'crypto';

// Import task event types
import type {
    CreateTaskEvent,
    UpdateTaskEvent,
    DeleteTaskEvent,
    GetTaskListEvent,
    GetTaskDetailEvent,
    StartTaskEvent,
    CreateTaskOptions,
    UpdateTaskOptions,
    GetTaskListOptions,
    GetTaskDetailOptions,
} from '@codebolt/types/agent-to-app-ws-schema';

// Import response types
import type {
    CreateTaskResponse,
    UpdateTaskResponse,
    DeleteTaskResponse,
    ListTasksResponse,
    GetTaskResponse,
    StartTaskWithAgentResponse,
    Task
} from '@codebolt/types/app-to-agent-ws-schema';

/**
 * Enhanced task service with comprehensive task and step management.
 * This module provides a modern API for task management based on the new task service schemas.
 */
const taskService = {

    /**
     * Creates a new task.
     * @param {CreateTaskOptions} options - The task creation parameters
     * @returns {Promise<CreateTaskResponse>}
     */
    createTask: async (options: CreateTaskOptions): Promise<CreateTaskResponse> => {
        const requestId = randomUUID();

        const event: CreateTaskEvent = {
            type: 'taskEvent',
            action: 'createTask',
            requestId,
            agentId: options.threadId,
            threadId: options.threadId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'addTaskResponse'
        );
    },

    /**
     * Updates an existing task.
     * @param {string} taskId - The task ID to update
     * @param {UpdateTaskOptions} updates - The task update parameters
     * @returns {Promise<UpdateTaskResponse>}
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
     * Deletes a task.
     * @param {string} taskId - The task ID to delete
     * @returns {Promise<DeleteTaskResponse>}
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
     * Retrieves a list of tasks.
     * @param {GetTaskListOptions} options - Optional filters for tasks
     * @returns {Promise<ListTasksResponse>}
     */
    getTaskList: async (options: GetTaskListOptions = {}): Promise<ListTasksResponse> => {
        const requestId = randomUUID();

        const event: GetTaskListEvent = {
            type: 'taskEvent',
            action: 'getTaskList',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTasksResponse'
        );
    },

    /**
     * Retrieves detailed information about a specific task.
     * @param {GetTaskDetailOptions} options - The task detail options
     * @returns {Promise<GetTaskResponse>}
     */
    getTaskDetail: async (options: GetTaskDetailOptions): Promise<GetTaskResponse> => {
        const requestId = randomUUID();

        const event: GetTaskDetailEvent = {
            type: 'taskEvent',
            action: 'getTaskDetail',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getTaskResponse'
        );
    },

    /**
     * Assigns an agent to a task.
     * @param {string} taskId - The task ID
     * @param {string} agentId - The agent ID to assign
     * @returns {Promise<UpdateTaskResponse>}
     */
    assignAgentToTask: async (taskId: string, agentId: string): Promise<UpdateTaskResponse> => {
        return taskService.updateTask(taskId, {
            assignedTo: agentId
        });
    },

    /**
     * Executes a task with a specific agent.
     * Assigns the agent and then starts the task.
     * @param {string} taskId - The task ID
     * @param {string} agentId - The agent ID
     * @returns {Promise<StartTaskWithAgentResponse>}
     */
    executeTaskWithAgent: async (taskId: string, agentId: string): Promise<StartTaskWithAgentResponse> => {
        await taskService.assignAgentToTask(taskId, agentId);

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
            'startTaskWithAgentResponse'
        );
    },

    /**
     * Gets the status of a task.
     * @param {string} taskId - The task ID
     * @returns {Promise<string | undefined>} The task status
     */
    getTaskStatus: async (taskId: string): Promise<string | undefined> => {
        const response = await taskService.getTaskDetail({ taskId });
        return response.task?.status;
    },

    /**
     * Gets the summary (description) of a task.
     * @param {string} taskId - The task ID
     * @returns {Promise<string | undefined>} The task description
     */
    getTaskSummary: async (taskId: string): Promise<string | undefined> => {
        const response = await taskService.getTaskDetail({ taskId });
        return response.task?.description;
    }

}

export default taskService;
