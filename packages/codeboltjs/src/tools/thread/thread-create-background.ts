/**
 * Thread Create Background Tool - Creates a thread in the background
 * Wraps the SDK's threadService.createThreadInBackground() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadCreateBackgroundParams {
    /** Optional group ID for the thread */
    groupId?: string;
    title?: string;
    task?: string;
    description?: string;
    userMessage?: string;
    selectedAgent?: any;
    isGrouped?: boolean;
}

class ThreadCreateBackgroundInvocation extends BaseToolInvocation<ThreadCreateBackgroundParams, ToolResult> {
    constructor(params: ThreadCreateBackgroundParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const optionsWithGroup = {
                title: this.params.title || this.params.task || 'Background Thread',
                description: this.params.description || this.params.task || '',
                userMessage: this.params.task || this.params.userMessage || '',
                selectedAgent: { id: this.params.selectedAgent },
                isGrouped: this.params.isGrouped,
                groupId: this.params.groupId,
            };

            const response = await threadService.createThreadInBackground(optionsWithGroup);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Thread creation in background failed';
                return {
                    llmContent: `Thread creation in background failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = 'Created thread in background successfully';
            if (resp.threadId) {
                output += `\n\nThread ID: ${resp.threadId}`;
            }
            if (this.params.groupId) {
                output += `\nGroup ID: ${this.params.groupId}`;
            }

            return {
                llmContent: output,
                returnDisplay: 'Thread created in background successfully',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating thread in background: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadCreateBackgroundTool extends BaseDeclarativeTool<ThreadCreateBackgroundParams, ToolResult> {
    static readonly Name: string = 'thread_create_background';

    constructor() {
        super(
            ThreadCreateBackgroundTool.Name,
            'ThreadCreateBackground',
            'Creates a thread in the background and resolves when the agent starts or fails.',
            Kind.Execute,
            {
                properties: {
                    groupId: {
                        description: 'Optional group ID for organizing threads.',
                        type: 'string',
                    },
                    title: {
                        description: 'Title of the background thread.',
                        type: 'string',
                    },
                    task: {
                        description: 'Task description related to the thread.',
                        type: 'string',
                    },
                    description: {
                        description: 'Description of the thread.',
                        type: 'string',
                    },
                    userMessage: {
                        description: 'The user message to start the thread with.',
                        type: 'string',
                    },
                    selectedAgent: {
                        description: 'The selected agent id get it from <workerAgent> tag ',
                        type: 'string',
                    },
                    isGrouped: {
                        description: 'Whether the thread belongs to a group',
                        type: 'boolean',
                    },
                },
                required: ['task', 'selectedAgent'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(_params: ThreadCreateBackgroundParams): string | null {
        return null;
    }

    protected createInvocation(params: ThreadCreateBackgroundParams): ToolInvocation<ThreadCreateBackgroundParams, ToolResult> {
        return new ThreadCreateBackgroundInvocation(params);
    }
}
