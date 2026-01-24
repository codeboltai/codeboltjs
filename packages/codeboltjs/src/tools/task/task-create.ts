/**
 * Task Create Tool - Creates a new task
 * Wraps the SDK's taskService.createTask() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';
import cbchat from '../../modules/chat';

export interface TaskCreateParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** Task title/name */
    title: string;
    /** Task description */
    description?: string;
    /** Thread ID for the task */
    thread_id?: string;
}

class TaskCreateInvocation extends BaseToolInvocation<TaskCreateParams, ToolResult> {
    constructor(params: TaskCreateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await taskService.createTask({
                name: this.params.title,
                description: this.params.description,
                threadId: this.params.thread_id || '',
            });

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task creation failed';
                return {
                    llmContent: `Task creation failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Created task: ${this.params.title}`;
            const resp = response as any;
            if (resp.task) {
                output += `\n\nTask ID: ${resp.task.id || resp.taskId}`;
            } else if (resp.taskId) {
                output += `\n\nTask ID: ${resp.taskId}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Created task: ${this.params.title}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating task: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TaskCreateTool extends BaseDeclarativeTool<TaskCreateParams, ToolResult> {
    static readonly Name: string = 'task_create';

    constructor() {
        super(
            TaskCreateTool.Name,
            'TaskCreate',
            'Creates a new task.',
            Kind.Other,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    title: {
                        description: 'The title/name of the task.',
                        type: 'string',
                    },
                    description: {
                        description: 'The description of the task.',
                        type: 'string',
                    },
                    thread_id: {
                        description: 'The thread ID for the task.',
                        type: 'string',
                    },
                },
                required: ['title'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TaskCreateParams): string | null {
        if (!params.title || params.title.trim() === '') {
            return "'title' is required for task create";
        }
        return null;
    }

    protected createInvocation(params: TaskCreateParams): ToolInvocation<TaskCreateParams, ToolResult> {
        return new TaskCreateInvocation(params);
    }
}
