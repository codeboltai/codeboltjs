/**
 * Task Execute Tool - Executes a task with an agent
 * Wraps the SDK's taskService.executeTaskWithAgent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';
import cbchat from '../../modules/chat';

export interface TaskExecuteParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The task ID to execute */
    task_id: string;
    /** The agent ID to execute the task with */
    agent_id: string;
}

class TaskExecuteInvocation extends BaseToolInvocation<TaskExecuteParams, ToolResult> {
    constructor(params: TaskExecuteParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await taskService.executeTaskWithAgent(this.params.task_id, this.params.agent_id);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task execution failed';
                return {
                    llmContent: `Task execution failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            return {
                llmContent: `Executing task ${this.params.task_id} with agent ${this.params.agent_id}`,
                returnDisplay: `Executing task ${this.params.task_id} with agent ${this.params.agent_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing task: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TaskExecuteTool extends BaseDeclarativeTool<TaskExecuteParams, ToolResult> {
    static readonly Name: string = 'task_execute';

    constructor() {
        super(
            TaskExecuteTool.Name,
            'TaskExecute',
            'Executes a task with a specific agent.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    task_id: {
                        description: 'The ID of the task to execute.',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent to execute the task with.',
                        type: 'string',
                    },
                },
                required: ['task_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TaskExecuteParams): string | null {
        if (!params.task_id || params.task_id.trim() === '') {
            return "'task_id' is required for task execute";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "'agent_id' is required for task execute";
        }
        return null;
    }

    protected createInvocation(params: TaskExecuteParams): ToolInvocation<TaskExecuteParams, ToolResult> {
        return new TaskExecuteInvocation(params);
    }
}
