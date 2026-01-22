/**
 * Task Management Tool - Manages tasks
 * Wraps the SDK's taskService methods
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';

/**
 * Supported task actions
 */
export type TaskActionType =
    | 'create'
    | 'update'
    | 'delete'
    | 'list'
    | 'get'
    | 'assign_agent'
    | 'execute';

/**
 * Parameters for the TaskManagement tool
 */
export interface TaskManagementToolParams {
    /**
     * The task action to perform
     */
    action: TaskActionType;

    /**
     * Task ID (required for update, delete, get, assign_agent, execute)
     */
    task_id?: string;

    /**
     * Task title (for create)
     */
    title?: string;

    /**
     * Task description (for create/update)
     */
    description?: string;

    /**
     * Task status (for update)
     */
    status?: string;

    /**
     * Agent ID (for assign_agent/execute)
     */
    agent_id?: string;

    /**
     * Thread ID (for create)
     */
    thread_id?: string;
}

class TaskManagementToolInvocation extends BaseToolInvocation<
    TaskManagementToolParams,
    ToolResult
> {
    constructor(params: TaskManagementToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const action = this.params.action;
            let response: any;
            let successMessage: string;

            switch (action) {
                case 'create':
                    if (!this.params.title) {
                        return this.createError("'title' is required for create action");
                    }
                    // CreateTaskOptions expects 'name' not 'title'
                    response = await taskService.createTask({
                        name: this.params.title,
                        description: this.params.description,
                        threadId: this.params.thread_id || '',
                    });
                    successMessage = `Created task: ${this.params.title}`;
                    break;

                case 'update':
                    if (!this.params.task_id) {
                        return this.createError("'task_id' is required for update action");
                    }
                    // UpdateTaskOptions uses 'name' and 'completed'
                    response = await taskService.updateTask(this.params.task_id, {
                        name: this.params.description,
                        completed: this.params.status === 'completed',
                    });
                    successMessage = `Updated task: ${this.params.task_id}`;
                    break;

                case 'delete':
                    if (!this.params.task_id) {
                        return this.createError("'task_id' is required for delete action");
                    }
                    response = await taskService.deleteTask(this.params.task_id);
                    successMessage = `Deleted task: ${this.params.task_id}`;
                    break;

                case 'list':
                    response = await taskService.getTaskList({});
                    successMessage = 'Retrieved task list';
                    break;

                case 'get':
                    if (!this.params.task_id) {
                        return this.createError("'task_id' is required for get action");
                    }
                    response = await taskService.getTaskDetail({ taskId: this.params.task_id });
                    successMessage = `Retrieved task: ${this.params.task_id}`;
                    break;

                case 'assign_agent':
                    if (!this.params.task_id) {
                        return this.createError("'task_id' is required for assign_agent action");
                    }
                    if (!this.params.agent_id) {
                        return this.createError("'agent_id' is required for assign_agent action");
                    }
                    response = await taskService.assignAgentToTask(this.params.task_id, this.params.agent_id);
                    successMessage = `Assigned agent ${this.params.agent_id} to task ${this.params.task_id}`;
                    break;

                case 'execute':
                    if (!this.params.task_id) {
                        return this.createError("'task_id' is required for execute action");
                    }
                    if (!this.params.agent_id) {
                        return this.createError("'agent_id' is required for execute action");
                    }
                    response = await taskService.executeTaskWithAgent(this.params.task_id, this.params.agent_id);
                    successMessage = `Executing task ${this.params.task_id} with agent ${this.params.agent_id}`;
                    break;

                default:
                    return this.createError(`Unknown action: ${action}`);
            }

            // Check for errors
            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task operation failed';
                return {
                    llmContent: `Task ${action} failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            // Format output
            let output = successMessage;

            if (action === 'list' && response.tasks) {
                output += `\n\nTasks (${response.tasks.length}):\n`;
                for (const task of response.tasks) {
                    output += `- [${task.status || 'pending'}] ${task.title || task.id}: ${task.description || ''}\n`;
                }
            } else if (action === 'get' && response.task) {
                const task = response.task;
                output += `\n\nTask Details:\n`;
                output += `ID: ${task.id}\n`;
                output += `Title: ${task.title}\n`;
                output += `Description: ${task.description || 'N/A'}\n`;
                output += `Status: ${task.status || 'pending'}\n`;
                if (task.assignedTo) output += `Assigned To: ${task.assignedTo}\n`;
            } else if (response.task) {
                output += `\n\nTask ID: ${response.task.id || response.taskId}`;
            } else if (response.taskId) {
                output += `\n\nTask ID: ${response.taskId}`;
            }

            return {
                llmContent: output,
                returnDisplay: successMessage,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing task ${this.params.action}: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private createError(message: string): ToolResult {
        return {
            llmContent: `Error: ${message}`,
            returnDisplay: `Error: ${message}`,
            error: {
                message,
                type: ToolErrorType.INVALID_TOOL_PARAMS,
            },
        };
    }
}

/**
 * Implementation of the TaskManagement tool logic
 */
export class TaskManagementTool extends BaseDeclarativeTool<
    TaskManagementToolParams,
    ToolResult
> {
    static readonly Name: string = 'create_task';

    constructor() {
        super(
            TaskManagementTool.Name,
            'TaskManagement',
            `Manages tasks - create, update, delete, list, get, assign agents, and execute tasks. Use this for task scheduling and workflow management.`,
            Kind.Other,
            {
                properties: {
                    action: {
                        description:
                            "The task action: 'create', 'update', 'delete', 'list', 'get', 'assign_agent', or 'execute'.",
                        type: 'string',
                        enum: ['create', 'update', 'delete', 'list', 'get', 'assign_agent', 'execute'],
                    },
                    task_id: {
                        description:
                            'Task ID (required for update, delete, get, assign_agent, execute).',
                        type: 'string',
                    },
                    title: {
                        description:
                            'Task title (required for create).',
                        type: 'string',
                    },
                    description: {
                        description:
                            'Task description (for create/update).',
                        type: 'string',
                    },
                    status: {
                        description:
                            'Task status (for update).',
                        type: 'string',
                    },
                    agent_id: {
                        description:
                            'Agent ID (required for assign_agent/execute).',
                        type: 'string',
                    },
                    thread_id: {
                        description:
                            'Thread ID (for create).',
                        type: 'string',
                    },
                },
                required: ['action'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TaskManagementToolParams,
    ): string | null {
        const validActions = ['create', 'update', 'delete', 'list', 'get', 'assign_agent', 'execute'];
        if (!validActions.includes(params.action)) {
            return `Invalid action: ${params.action}. Must be one of: ${validActions.join(', ')}`;
        }

        switch (params.action) {
            case 'create':
                if (!params.title) {
                    return "'title' is required for create action";
                }
                break;
            case 'update':
            case 'delete':
            case 'get':
                if (!params.task_id) {
                    return `'task_id' is required for ${params.action} action`;
                }
                break;
            case 'assign_agent':
            case 'execute':
                if (!params.task_id) {
                    return `'task_id' is required for ${params.action} action`;
                }
                if (!params.agent_id) {
                    return `'agent_id' is required for ${params.action} action`;
                }
                break;
        }

        return null;
    }

    protected createInvocation(
        params: TaskManagementToolParams,
    ): ToolInvocation<TaskManagementToolParams, ToolResult> {
        return new TaskManagementToolInvocation(params);
    }
}
