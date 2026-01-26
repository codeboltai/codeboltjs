/**
 * Thread Create Background Tool - Creates a thread in the background
 * Wraps the SDK's threadService.createThreadInBackground() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadCreateBackgroundParams {
    /** Thread creation options */
    options: Record<string, any>;
    /** Optional group ID for the thread */
    groupId?: string;
}

class ThreadCreateBackgroundInvocation extends BaseToolInvocation<ThreadCreateBackgroundParams, ToolResult> {
    constructor(params: ThreadCreateBackgroundParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Include groupId in options if provided
            const optionsWithGroup = {
                ...this.params.options,
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
                    options: {
                        description: 'Thread creation options object containing thread parameters.',
                        type: 'object',
                    },
                    groupId: {
                        description: 'Optional group ID for organizing threads.',
                        type: 'string',
                    },
                },
                required: ['options'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadCreateBackgroundParams): string | null {
        if (!params.options || typeof params.options !== 'object') {
            return "'options' is required and must be an object";
        }
        return null;
    }

    protected createInvocation(params: ThreadCreateBackgroundParams): ToolInvocation<ThreadCreateBackgroundParams, ToolResult> {
        return new ThreadCreateBackgroundInvocation(params);
    }
}
