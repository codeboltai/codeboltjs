/**
 * Thread Get Tool - Retrieves detailed information about a specific thread
 * Wraps the SDK's threadService.getThreadDetail() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadGetParams {
    /** The thread ID to retrieve */
    threadId: string;
}

class ThreadGetInvocation extends BaseToolInvocation<ThreadGetParams, ToolResult> {
    constructor(params: ThreadGetParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.getThreadDetail({ taskId: this.params.threadId } as any);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to retrieve thread details';
                return {
                    llmContent: `Failed to retrieve thread details: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = `Thread details for: ${this.params.threadId}`;
            if (resp.thread) {
                output += `\n\nThread: ${JSON.stringify(resp.thread, null, 2)}`;
            } else {
                output += `\n\nResponse: ${JSON.stringify(resp, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Retrieved thread: ${this.params.threadId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving thread details: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadGetTool extends BaseDeclarativeTool<ThreadGetParams, ToolResult> {
    static readonly Name: string = 'thread_get';

    constructor() {
        super(
            ThreadGetTool.Name,
            'ThreadGet',
            'Retrieves detailed information about a specific thread.',
            Kind.Read,
            {
                properties: {
                    threadId: {
                        description: 'The ID of the thread to retrieve.',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadGetParams): string | null {
        if (!params.threadId || params.threadId.trim() === '') {
            return "'threadId' is required";
        }
        return null;
    }

    protected createInvocation(params: ThreadGetParams): ToolInvocation<ThreadGetParams, ToolResult> {
        return new ThreadGetInvocation(params);
    }
}
