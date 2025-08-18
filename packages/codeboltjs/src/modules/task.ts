import cbws from '../core/websocket';
import type { 
    Task, 
    SubTask, 
    TaskResponse,
    TaskAddParams,
    TaskGetParams,
    TaskUpdateParams,
    SubTaskAddParams,
    SubTaskUpdateParams
} from '../types/libFunctionTypes';
import { EventType, TaskAction, TaskResponseType } from '@codebolt/types';

/**
 * Enhanced task planner with agent-based organization and comprehensive task management.
 */
const taskplaner = {
    /**
     * Adds a new task with enhanced parameters.
     * @param {TaskAddParams} params - The task parameters including title, agentId, description, etc.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    addTask: async (params: TaskAddParams): Promise<TaskResponse> => {
        const { title, agentId = 'default-agent', description, phase, category, priority, tags } = params;
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action:TaskAction.ADD_TASK,
                agentId: agentId,
                message: {
                    title: title,
                    description: description,
                    phase: phase,
                    category: category,
                    priority: priority,
                    tags: tags
                }
            },
            TaskResponseType.ADD_TASK_RESPONSE
        );
    },

    /**
     * Adds a task using simple string parameter (legacy support).
     * @param {string} task - The task title.
     * @param {string} agentId - The agent ID (optional, defaults to 'default-agent').
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    addSimpleTask: async (task: string, agentId: string = 'default-agent'): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.ADD_TASK,
                agentId: agentId,
                message: {
                    task: task
                }
            },
            TaskResponseType.ADD_TASK_RESPONSE
        );
    },

    /**
     * Retrieves all tasks with optional filtering.
     * @param {TaskGetParams} filters - Optional filters for agentId, category, phase, etc.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the get tasks event.
     */
    getTasks: async (filters: TaskGetParams = {}): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.GET_TASKS,
                message: filters
            },
            TaskResponseType.GET_TASKS_RESPONSE
        );
    },
    
    /**
     * Retrieves tasks for a specific agent.
     * @param {string} agentId - The agent ID.
     * @returns {Promise<TaskResponse>} A promise that resolves with tasks for the specified agent.
     */
    getTasksByAgent: async (agentId: string): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.GET_TASKS_BY_AGENT,
                message: {
                    agentId: agentId
                }
            },
            TaskResponseType.GET_TASKS_BY_AGENT_RESPONSE
        );
    },

    /**
     * Retrieves tasks by category.
     * @param {string} category - The category name.
     * @returns {Promise<TaskResponse>} A promise that resolves with tasks in the specified category.
     */
    getTasksByCategory: async (category: string): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.GET_TASKS_BY_CATEGORY,
                message: {
                    category: category
                }
            },
            TaskResponseType.GET_TASKS_BY_CATEGORY_RESPONSE
        );
    },

    /**
     * Retrieves all available agents.
     * @returns {Promise<TaskResponse>} A promise that resolves with the list of all agents.
     */
    getAllAgents: async (): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.GET_ALL_AGENTS
            },
            TaskResponseType.GET_ALL_AGENTS_RESPONSE
        );
    },

    /**
     * Updates an existing task.
     * @param {TaskUpdateParams} params - The task update parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    updateTask: async (params: TaskUpdateParams): Promise<TaskResponse> => {
        const { taskId, ...updates } = params;
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.UPDATE_TASK,
                message: {
                    taskId: taskId,
                    ...updates
                }
            },
            TaskResponseType.UPDATE_TASKS_RESPONSE
        );
    },

    /**
     * Updates an existing task using legacy string parameter.
     * @param {string} taskId - The task ID.
     * @param {string} task - The updated task information.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    updateSimpleTask: async (taskId: string, task: string): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.UPDATE_TASK,
                message: {
                    taskId: taskId,
                    task: task
                }
            },
            TaskResponseType.UPDATE_TASKS_RESPONSE
        );
    },

    /**
     * Deletes a task.
     * @param {string} taskId - The task ID to delete.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the delete task event.
     */
    deleteTask: async (taskId: string): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.DELETE_TASK,
                message: {
                    taskId: taskId
                }
            },
            TaskResponseType.DELETE_TASK_RESPONSE
        );
    },

    /**
     * Adds a subtask to an existing task.
     * @param {SubTaskAddParams} params - The subtask parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add subtask event.
     */
    addSubTask: async (params: SubTaskAddParams): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.ADD_SUB_TASK,
                message: params
            },
            TaskResponseType.ADD_SUB_TASK_RESPONSE
        );
    },

    /**
     * Updates an existing subtask.
     * @param {SubTaskUpdateParams} params - The subtask update parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update subtask event.
     */
    updateSubTask: async (params: SubTaskUpdateParams): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.UPDATE_SUB_TASK,
                message: params
            },
            TaskResponseType.UPDATE_SUB_TASK_RESPONSE
        );
    },

    /**
     * Deletes a subtask.
     * @param {string} taskId - The parent task ID.
     * @param {string} subtaskId - The subtask ID to delete.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the delete subtask event.
     */
    deleteSubTask: async (taskId: string, subtaskId: string): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.DELETE_SUB_TASK,
                message: {
                    taskId: taskId,
                    subtaskId: subtaskId
                }
            },
            TaskResponseType.DELETE_SUB_TASK_RESPONSE
        );
    },

    /**
     * Creates tasks from markdown content.
     * @param {TaskMarkdownImportOptions} params - The markdown parameters including content, agentId, phase, and category.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the create tasks from markdown event.
     */
    createTasksFromMarkdown: async (params: TaskMarkdownImportOptions): Promise<TaskResponse> => {
        const { markdown, agentId = 'default-agent', phase, category } = params;
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.CREATE_TASKS_FROM_MARKDOWN,
                agentId: agentId,
                message: {
                    markdown: markdown,
                    phase: phase,
                    category: category
                }
            },
            TaskResponseType.CREATE_TASKS_FROM_MARKDOWN_RESPONSE
        );
    },

    /**
     * Exports tasks to markdown format.
     * @param {TaskMarkdownExportOptions} params - The export parameters including optional phase, agentId, and category filters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the markdown content.
     */
    exportTasksToMarkdown: async (params: TaskMarkdownExportOptions = {}): Promise<TaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: EventType.TASK_EVENT,
                action: TaskAction.EXPORT_TASKS_TO_MARKDOWN,
                message: params
            },
            TaskResponseType.EXPORT_TASKS_TO_MARKDOWN_RESPONSE
        );
    },

    /**
     * Utility function to toggle task completion status.
     * @param {string} taskId - The task ID.
     * @param {boolean} completed - The new completion status.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    toggleTaskCompletion: async (taskId: string, completed: boolean): Promise<TaskResponse> => {
        return taskplaner.updateTask({
            taskId: taskId,
            completed: completed
        });
    },

    /**
     * Utility function to toggle subtask completion status.
     * @param {string} taskId - The parent task ID.
     * @param {string} subtaskId - The subtask ID.
     * @param {boolean} completed - The new completion status.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update subtask event.
     */
    toggleSubTaskCompletion: async (taskId: string, subtaskId: string, completed: boolean): Promise<TaskResponse> => {
        return taskplaner.updateSubTask({
            taskId: taskId,
            subtaskId: subtaskId,
            completed: completed
        });
    },

    /**
     * Utility function to move a task to a different agent.
     * @param {string} taskId - The task ID.
     * @param {string} newAgentId - The new agent ID.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    moveTaskToAgent: async (taskId: string, newAgentId: string): Promise<TaskResponse> => {
        return taskplaner.updateTask({
            taskId: taskId,
            agentId: newAgentId
        });
    },

    /**
     * Utility function to set task priority.
     * @param {string} taskId - The task ID.
     * @param {'low' | 'medium' | 'high'} priority - The priority level.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    setTaskPriority: async (taskId: string, priority: 'low' | 'medium' | 'high'): Promise<TaskResponse> => {
        return taskplaner.updateTask({
            taskId: taskId,
            priority: priority
        });
    },

    /**
     * Utility function to add tags to a task.
     * @param {string} taskId - The task ID.
     * @param {string[]} tags - The tags to add.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    addTaskTags: async (taskId: string, tags: string[]): Promise<TaskResponse> => {
        return taskplaner.updateTask({
            taskId: taskId,
            tags: tags
        });
    },

    /**
     * Utility function to create a quick task with minimal parameters.
     * @param {string} title - The task title.
     * @param {string} agentId - The agent ID (optional, defaults to 'default-agent').
     * @param {string} category - The category (optional).
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    createQuickTask: async (title: string, agentId: string = 'default-agent', category?: string): Promise<TaskResponse> => {
        return taskplaner.addTask({
            title: title,
            agentId: agentId,
            category: category,
            priority: 'medium'
        });
    }
};

// Export types for external use
export type {
    Task,
    SubTask,
    TaskResponse,
    TaskCreateOptions,
    TaskUpdateOptions,
    AddSubTaskOptions,
    UpdateSubTaskOptions,
    TaskFilterOptions,
    TaskMarkdownImportOptions,
    TaskMarkdownExportOptions
};

export default taskplaner;
