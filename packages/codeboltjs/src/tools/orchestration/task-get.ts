/**
 * Task Get Tool - Gets details of a specific task
 * Wraps the SDK's taskService.getTaskDetail() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';
import cbchat from '../../modules/chat';

export interface TaskGetParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The task ID to get details for */
    task_id: string;
}

class TaskGetInvocation extends BaseToolInvocation<TaskGetParams, ToolResult> {
    constructor(params: TaskGetParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await taskService.getTaskDetail({ taskId: this.params.task_id });

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task retrieval failed';
                return {
                    llmContent: `Task retrieval failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            let output = `Retrieved task: ${this.params.task_id}`;
            const resp = response as any;
            if (resp.task) {
                const task = resp.task;
                output += `\n\nTask Details:\n`;
                output += `ID: ${task.id}\n`;
                output += `Title: ${task.title || task.name || 'N/A'}\n`;
                output += `Description: ${task.description || 'N/A'}\n`;
                output += `Status: ${task.status || 'pending'}\n`;
                if (task.assignedTo) output += `Assigned To: ${task.assignedTo}\n`;
            }

            return {
                llmContent: output,
                returnDisplay: `Retrieved task: ${this.params.task_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting task: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TaskGetTool extends BaseDeclarativeTool<TaskGetParams, ToolResult> {
    static readonly Name: string = 'task_get';

    constructor() {
        super(
            TaskGetTool.Name,
            'TaskGet',
            'Retrieves details of a specific task.',
            Kind.Read,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    task_id: {
                        description: 'The ID of the task to retrieve.',
                        type: 'string',
                    },
                },
                required: ['task_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TaskGetParams): string | null {
        if (!params.task_id || params.task_id.trim() === '') {
            return "'task_id' is required for task get";
        }
        return null;
    }

    protected createInvocation(params: TaskGetParams): ToolInvocation<TaskGetParams, ToolResult> {
        return new TaskGetInvocation(params);
    }
}
