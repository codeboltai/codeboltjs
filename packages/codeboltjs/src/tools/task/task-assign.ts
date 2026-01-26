/**
 * Task Assign Tool - Assigns an agent to a task
 * Wraps the SDK's taskService.assignAgentToTask() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import taskService from '../../modules/task';
import cbchat from '../../modules/chat';

export interface TaskAssignParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The task ID to assign */
    task_id: string;
    /** The agent ID to assign to the task */
    agent_id: string;
}

class TaskAssignInvocation extends BaseToolInvocation<TaskAssignParams, ToolResult> {
    constructor(params: TaskAssignParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await taskService.assignAgentToTask(this.params.task_id, this.params.agent_id);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Task assignment failed';
                return {
                    llmContent: `Task assignment failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            return {
                llmContent: `Assigned agent ${this.params.agent_id} to task ${this.params.task_id}`,
                returnDisplay: `Assigned agent ${this.params.agent_id} to task ${this.params.task_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error assigning agent to task: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TaskAssignTool extends BaseDeclarativeTool<TaskAssignParams, ToolResult> {
    static readonly Name: string = 'task_assign';

    constructor() {
        super(
            TaskAssignTool.Name,
            'TaskAssign',
            'Assigns an agent to a task.',
            Kind.Other,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    task_id: {
                        description: 'The ID of the task.',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent to assign.',
                        type: 'string',
                    },
                },
                required: ['task_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TaskAssignParams): string | null {
        if (!params.task_id || params.task_id.trim() === '') {
            return "'task_id' is required for task assign";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "'agent_id' is required for task assign";
        }
        return null;
    }

    protected createInvocation(params: TaskAssignParams): ToolInvocation<TaskAssignParams, ToolResult> {
        return new TaskAssignInvocation(params);
    }
}
