/**
 * Task Update Tool - Updates an existing task
 * Wraps the SDK's taskService.updateTask() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';

export interface TaskUpdateParams {
    /** The task ID to update */
    task_id: string;
    /** New name for the task */
    name?: string;
    /** Whether the task is completed */
    completed?: boolean;
    /** Task status */
    status?: string;
}

class TaskUpdateInvocation extends BaseToolInvocation<TaskUpdateParams, ToolResult> {
    constructor(params: TaskUpdateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updates: any = {};
            if (this.params.name !== undefined) updates.name = this.params.name;
            if (this.params.completed !== undefined) updates.completed = this.params.completed;
            if (this.params.status !== undefined) updates.completed = this.params.status === 'completed';

            const response = await taskService.updateTask(this.params.task_id, updates);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task update failed';
                return {
                    llmContent: `Task update failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            return {
                llmContent: `Updated task: ${this.params.task_id}`,
                returnDisplay: `Updated task: ${this.params.task_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating task: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TaskUpdateTool extends BaseDeclarativeTool<TaskUpdateParams, ToolResult> {
    static readonly Name: string = 'task_update';

    constructor() {
        super(
            TaskUpdateTool.Name,
            'TaskUpdate',
            'Updates an existing task.',
            Kind.Other,
            {
                properties: {
                    task_id: {
                        description: 'The ID of the task to update.',
                        type: 'string',
                    },
                    name: {
                        description: 'New name for the task.',
                        type: 'string',
                    },
                    completed: {
                        description: 'Whether the task is completed.',
                        type: 'boolean',
                    },
                    status: {
                        description: "Task status (e.g., 'completed', 'pending').",
                        type: 'string',
                    },
                },
                required: ['task_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TaskUpdateParams): string | null {
        if (!params.task_id || params.task_id.trim() === '') {
            return "'task_id' is required for task update";
        }
        return null;
    }

    protected createInvocation(params: TaskUpdateParams): ToolInvocation<TaskUpdateParams, ToolResult> {
        return new TaskUpdateInvocation(params);
    }
}
