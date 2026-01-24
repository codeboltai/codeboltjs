/**
 * Task List Tool - Lists all tasks
 * Wraps the SDK's taskService.getTaskList() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';
import cbchat from '../../modules/chat';

export interface TaskListParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    // No required parameters
}

class TaskListInvocation extends BaseToolInvocation<TaskListParams, ToolResult> {
    constructor(params: TaskListParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await taskService.getTaskList({});

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task list retrieval failed';
                return {
                    llmContent: `Task list retrieval failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = 'Retrieved task list';
            const resp = response as any;
            if (resp.tasks) {
                output += `\n\nTasks (${resp.tasks.length}):\n`;
                for (const task of resp.tasks) {
                    output += `- [${task.status || 'pending'}] ${task.title || task.name || task.id}: ${task.description || ''}\n`;
                }
            }

            return {
                llmContent: output,
                returnDisplay: 'Retrieved task list',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing tasks: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TaskListTool extends BaseDeclarativeTool<TaskListParams, ToolResult> {
    static readonly Name: string = 'task_list';

    constructor() {
        super(
            TaskListTool.Name,
            'TaskList',
            'Retrieves a list of all tasks.',
            Kind.Read,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: TaskListParams): ToolInvocation<TaskListParams, ToolResult> {
        return new TaskListInvocation(params);
    }
}
