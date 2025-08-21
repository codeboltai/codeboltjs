"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
/**
 * Enhanced task planner with agent-based organization and comprehensive task management.
 */
const taskplaner = {
    /**
     * Adds a new task with enhanced parameters.
     * @param {TaskCreateOptions} params - The task parameters including title, agentId, description, etc.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    addTask: async (params) => {
        const { title, agentId = 'default-agent', description, phase, category, priority, tags } = params;
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.ADD_TASK,
            agentId: agentId,
            message: {
                title: title,
                description: description,
                phase: phase,
                category: category,
                priority: priority,
                tags: tags
            }
        }, enum_1.TaskResponseType.ADD_TASK_RESPONSE);
    },
    /**
     * Adds a task using simple string parameter (legacy support).
     * @param {string} task - The task title.
     * @param {string} agentId - The agent ID (optional, defaults to 'default-agent').
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    addSimpleTask: async (task, agentId = 'default-agent') => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.ADD_TASK,
            agentId: agentId,
            message: {
                task: task
            }
        }, enum_1.TaskResponseType.ADD_TASK_RESPONSE);
    },
    /**
     * Retrieves all tasks with optional filtering.
     * @param {TaskFilterOptions} filters - Optional filters for agentId, category, phase, etc.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the get tasks event.
     */
    getTasks: async (filters = {}) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.GET_TASKS,
            message: filters
        }, enum_1.TaskResponseType.GET_TASKS_RESPONSE);
    },
    /**
     * Retrieves tasks for a specific agent.
     * @param {string} agentId - The agent ID.
     * @returns {Promise<TaskResponse>} A promise that resolves with tasks for the specified agent.
     */
    getTasksByAgent: async (agentId) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.GET_TASKS_BY_AGENT,
            message: {
                agentId: agentId
            }
        }, enum_1.TaskResponseType.GET_TASKS_BY_AGENT_RESPONSE);
    },
    /**
     * Retrieves tasks by category.
     * @param {string} category - The category name.
     * @returns {Promise<TaskResponse>} A promise that resolves with tasks in the specified category.
     */
    getTasksByCategory: async (category) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.GET_TASKS_BY_CATEGORY,
            message: {
                category: category
            }
        }, enum_1.TaskResponseType.GET_TASKS_BY_CATEGORY_RESPONSE);
    },
    /**
     * Retrieves all available agents.
     * @returns {Promise<TaskResponse>} A promise that resolves with the list of all agents.
     */
    getAllAgents: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.GET_ALL_AGENTS
        }, enum_1.TaskResponseType.GET_ALL_AGENTS_RESPONSE);
    },
    /**
     * Updates an existing task.
     * @param {TaskUpdateOptions} params - The task update parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    updateTask: async (params) => {
        const { taskId, ...updates } = params;
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.UPDATE_TASK,
            message: {
                taskId: taskId,
                ...updates
            }
        }, enum_1.TaskResponseType.UPDATE_TASKS_RESPONSE);
    },
    /**
     * Updates an existing task using legacy string parameter.
     * @param {string} taskId - The task ID.
     * @param {string} task - The updated task information.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    updateSimpleTask: async (taskId, task) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.UPDATE_TASK,
            message: {
                taskId: taskId,
                task: task
            }
        }, enum_1.TaskResponseType.UPDATE_TASKS_RESPONSE);
    },
    /**
     * Deletes a task.
     * @param {string} taskId - The task ID to delete.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the delete task event.
     */
    deleteTask: async (taskId) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.DELETE_TASK,
            message: {
                taskId: taskId
            }
        }, enum_1.TaskResponseType.DELETE_TASK_RESPONSE);
    },
    /**
     * Adds a subtask to an existing task.
     * @param {AddSubTaskOptions} params - The subtask parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add subtask event.
     */
    addSubTask: async (params) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.ADD_SUB_TASK,
            message: params
        }, enum_1.TaskResponseType.ADD_SUB_TASK_RESPONSE);
    },
    /**
     * Updates an existing subtask.
     * @param {UpdateSubTaskOptions} params - The subtask update parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update subtask event.
     */
    updateSubTask: async (params) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.UPDATE_SUB_TASK,
            message: params
        }, enum_1.TaskResponseType.UPDATE_SUB_TASK_RESPONSE);
    },
    /**
     * Deletes a subtask.
     * @param {string} taskId - The parent task ID.
     * @param {string} subtaskId - The subtask ID to delete.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the delete subtask event.
     */
    deleteSubTask: async (taskId, subtaskId) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.DELETE_SUB_TASK,
            message: {
                taskId: taskId,
                subtaskId: subtaskId
            }
        }, enum_1.TaskResponseType.DELETE_SUB_TASK_RESPONSE);
    },
    /**
     * Creates tasks from markdown content.
     * @param {TaskMarkdownImportOptions} params - The markdown parameters including content, agentId, phase, and category.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the create tasks from markdown event.
     */
    createTasksFromMarkdown: async (params) => {
        const { markdown, agentId = 'default-agent', phase, category } = params;
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.CREATE_TASKS_FROM_MARKDOWN,
            agentId: agentId,
            message: {
                markdown: markdown,
                phase: phase,
                category: category
            }
        }, enum_1.TaskResponseType.CREATE_TASKS_FROM_MARKDOWN_RESPONSE);
    },
    /**
     * Exports tasks to markdown format.
     * @param {TaskMarkdownExportOptions} params - The export parameters including optional phase, agentId, and category filters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the markdown content.
     */
    exportTasksToMarkdown: async (params = {}) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            type: enum_1.EventType.TASK_EVENT,
            action: enum_1.TaskAction.EXPORT_TASKS_TO_MARKDOWN,
            message: params
        }, enum_1.TaskResponseType.EXPORT_TASKS_TO_MARKDOWN_RESPONSE);
    },
    /**
     * Utility function to toggle task completion status.
     * @param {string} taskId - The task ID.
     * @param {boolean} completed - The new completion status.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    toggleTaskCompletion: async (taskId, completed) => {
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
    toggleSubTaskCompletion: async (taskId, subtaskId, completed) => {
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
    moveTaskToAgent: async (taskId, newAgentId) => {
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
    setTaskPriority: async (taskId, priority) => {
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
    addTaskTags: async (taskId, tags) => {
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
    createQuickTask: async (title, agentId = 'default-agent', category) => {
        return taskplaner.addTask({
            title: title,
            agentId: agentId,
            category: category,
            priority: 'medium'
        });
    }
};
exports.default = taskplaner;
