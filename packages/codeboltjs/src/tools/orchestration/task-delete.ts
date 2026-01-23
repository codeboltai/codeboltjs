/**
 * Task Delete Tool - Deletes a task
 * Wraps the SDK's taskService.deleteTask() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';

export interface TaskDeleteParams {
    /** The task ID to delete */
    task_id: string;
}

class TaskDeleteInvocation extends BaseToolInvocation<TaskDeleteParams, ToolResult> {
    constructor(params: TaskDeleteParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await taskService.deleteTask(this.params.task_id);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task deletion failed';
                return {
                    llmContent: `Task deletion failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            return {
                llmContent: `Deleted task: ${this.params.task_id}`,
                returnDisplay: `Deleted task: ${this.params.task_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting task: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TaskDeleteTool extends BaseDeclarativeTool<TaskDeleteParams, ToolResult> {
    static readonly Name: string = 'task_delete';

    constructor() {
        super(
            TaskDeleteTool.Name,
            'TaskDelete',
            'Deletes a task.',
            Kind.Delete,
            {
                properties: {
                    task_id: {
                        description: 'The ID of the task to delete.',
                        type: 'string',
                    },
                },
                required: ['task_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TaskDeleteParams): string | null {
        if (!params.task_id || params.task_id.trim() === '') {
            return "'task_id' is required for task delete";
        }
        return null;
    }

    protected createInvocation(params: TaskDeleteParams): ToolInvocation<TaskDeleteParams, ToolResult> {
        return new TaskDeleteInvocation(params);
    }
}
