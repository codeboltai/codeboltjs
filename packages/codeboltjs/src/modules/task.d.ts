import type { Task, SubTask, TaskResponse, TaskCreateOptions, TaskUpdateOptions, AddSubTaskOptions, UpdateSubTaskOptions, TaskFilterOptions, TaskMarkdownImportOptions, TaskMarkdownExportOptions } from '../types';
/**
 * Enhanced task planner with agent-based organization and comprehensive task management.
 */
declare const taskplaner: {
    /**
     * Adds a new task with enhanced parameters.
     * @param {TaskCreateOptions} params - The task parameters including title, agentId, description, etc.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    addTask: (params: TaskCreateOptions) => Promise<TaskResponse>;
    /**
     * Adds a task using simple string parameter (legacy support).
     * @param {string} task - The task title.
     * @param {string} agentId - The agent ID (optional, defaults to 'default-agent').
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    addSimpleTask: (task: string, agentId?: string) => Promise<TaskResponse>;
    /**
     * Retrieves all tasks with optional filtering.
     * @param {TaskFilterOptions} filters - Optional filters for agentId, category, phase, etc.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the get tasks event.
     */
    getTasks: (filters?: TaskFilterOptions) => Promise<TaskResponse>;
    /**
     * Retrieves tasks for a specific agent.
     * @param {string} agentId - The agent ID.
     * @returns {Promise<TaskResponse>} A promise that resolves with tasks for the specified agent.
     */
    getTasksByAgent: (agentId: string) => Promise<TaskResponse>;
    /**
     * Retrieves tasks by category.
     * @param {string} category - The category name.
     * @returns {Promise<TaskResponse>} A promise that resolves with tasks in the specified category.
     */
    getTasksByCategory: (category: string) => Promise<TaskResponse>;
    /**
     * Retrieves all available agents.
     * @returns {Promise<TaskResponse>} A promise that resolves with the list of all agents.
     */
    getAllAgents: () => Promise<TaskResponse>;
    /**
     * Updates an existing task.
     * @param {TaskUpdateOptions} params - The task update parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    updateTask: (params: TaskUpdateOptions) => Promise<TaskResponse>;
    /**
     * Updates an existing task using legacy string parameter.
     * @param {string} taskId - The task ID.
     * @param {string} task - The updated task information.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    updateSimpleTask: (taskId: string, task: string) => Promise<TaskResponse>;
    /**
     * Deletes a task.
     * @param {string} taskId - The task ID to delete.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the delete task event.
     */
    deleteTask: (taskId: string) => Promise<TaskResponse>;
    /**
     * Adds a subtask to an existing task.
     * @param {AddSubTaskOptions} params - The subtask parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add subtask event.
     */
    addSubTask: (params: AddSubTaskOptions) => Promise<TaskResponse>;
    /**
     * Updates an existing subtask.
     * @param {UpdateSubTaskOptions} params - The subtask update parameters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update subtask event.
     */
    updateSubTask: (params: UpdateSubTaskOptions) => Promise<TaskResponse>;
    /**
     * Deletes a subtask.
     * @param {string} taskId - The parent task ID.
     * @param {string} subtaskId - The subtask ID to delete.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the delete subtask event.
     */
    deleteSubTask: (taskId: string, subtaskId: string) => Promise<TaskResponse>;
    /**
     * Creates tasks from markdown content.
     * @param {TaskMarkdownImportOptions} params - The markdown parameters including content, agentId, phase, and category.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the create tasks from markdown event.
     */
    createTasksFromMarkdown: (params: TaskMarkdownImportOptions) => Promise<TaskResponse>;
    /**
     * Exports tasks to markdown format.
     * @param {TaskMarkdownExportOptions} params - The export parameters including optional phase, agentId, and category filters.
     * @returns {Promise<TaskResponse>} A promise that resolves with the markdown content.
     */
    exportTasksToMarkdown: (params?: TaskMarkdownExportOptions) => Promise<TaskResponse>;
    /**
     * Utility function to toggle task completion status.
     * @param {string} taskId - The task ID.
     * @param {boolean} completed - The new completion status.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<TaskResponse>;
    /**
     * Utility function to toggle subtask completion status.
     * @param {string} taskId - The parent task ID.
     * @param {string} subtaskId - The subtask ID.
     * @param {boolean} completed - The new completion status.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update subtask event.
     */
    toggleSubTaskCompletion: (taskId: string, subtaskId: string, completed: boolean) => Promise<TaskResponse>;
    /**
     * Utility function to move a task to a different agent.
     * @param {string} taskId - The task ID.
     * @param {string} newAgentId - The new agent ID.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    moveTaskToAgent: (taskId: string, newAgentId: string) => Promise<TaskResponse>;
    /**
     * Utility function to set task priority.
     * @param {string} taskId - The task ID.
     * @param {'low' | 'medium' | 'high'} priority - The priority level.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    setTaskPriority: (taskId: string, priority: "low" | "medium" | "high") => Promise<TaskResponse>;
    /**
     * Utility function to add tags to a task.
     * @param {string} taskId - The task ID.
     * @param {string[]} tags - The tags to add.
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the update task event.
     */
    addTaskTags: (taskId: string, tags: string[]) => Promise<TaskResponse>;
    /**
     * Utility function to create a quick task with minimal parameters.
     * @param {string} title - The task title.
     * @param {string} agentId - The agent ID (optional, defaults to 'default-agent').
     * @param {string} category - The category (optional).
     * @returns {Promise<TaskResponse>} A promise that resolves with the response from the add task event.
     */
    createQuickTask: (title: string, agentId?: string, category?: string) => Promise<TaskResponse>;
};
export type { Task, SubTask, TaskResponse, TaskCreateOptions, TaskUpdateOptions, AddSubTaskOptions, UpdateSubTaskOptions, TaskFilterOptions, TaskMarkdownImportOptions, TaskMarkdownExportOptions };
export default taskplaner;
