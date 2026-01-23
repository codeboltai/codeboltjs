/**
 * Thread Create Tool - Creates a new thread
 * Wraps the SDK's threadService.createThread() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadCreateParams {
    /** Thread creation options */
    options: Record<string, any>;
}

class ThreadCreateInvocation extends BaseToolInvocation<ThreadCreateParams, ToolResult> {
    constructor(params: ThreadCreateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.createThread(this.params.options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Thread creation failed';
                return {
                    llmContent: `Thread creation failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = 'Created thread successfully';
            if (resp.threadId) {
                output += `\n\nThread ID: ${resp.threadId}`;
            }
            if (resp.thread) {
                output += `\n\nThread: ${JSON.stringify(resp.thread, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: 'Thread created successfully',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating thread: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadCreateTool extends BaseDeclarativeTool<ThreadCreateParams, ToolResult> {
    static readonly Name: string = 'thread_create';

    constructor() {
        super(
            ThreadCreateTool.Name,
            'ThreadCreate',
            'Creates a new thread with the specified options.',
            Kind.Edit,
            {
                properties: {
                    options: {
                        description: 'Thread creation options object containing thread parameters.',
                        type: 'object',
                    },
                },
                required: ['options'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadCreateParams): string | null {
        if (!params.options || typeof params.options !== 'object') {
            return "'options' is required and must be an object";
        }
        return null;
    }

    protected createInvocation(params: ThreadCreateParams): ToolInvocation<ThreadCreateParams, ToolResult> {
        return new ThreadCreateInvocation(params);
    }
}
