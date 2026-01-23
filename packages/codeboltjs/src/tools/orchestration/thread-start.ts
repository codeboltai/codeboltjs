/**
 * Thread Start Tool - Starts a thread
 * Wraps the SDK's threadService.startThread() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadStartParams {
    /** The thread ID to start */
    threadId: string;
}

class ThreadStartInvocation extends BaseToolInvocation<ThreadStartParams, ToolResult> {
    constructor(params: ThreadStartParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.startThread(this.params.threadId);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Thread start failed';
                return {
                    llmContent: `Thread start failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = `Started thread: ${this.params.threadId}`;
            if (resp.thread) {
                output += `\n\nThread: ${JSON.stringify(resp.thread, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Started thread: ${this.params.threadId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting thread: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadStartTool extends BaseDeclarativeTool<ThreadStartParams, ToolResult> {
    static readonly Name: string = 'thread_start';

    constructor() {
        super(
            ThreadStartTool.Name,
            'ThreadStart',
            'Starts a thread by its ID.',
            Kind.Execute,
            {
                properties: {
                    threadId: {
                        description: 'The ID of the thread to start.',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadStartParams): string | null {
        if (!params.threadId || params.threadId.trim() === '') {
            return "'threadId' is required";
        }
        return null;
    }

    protected createInvocation(params: ThreadStartParams): ToolInvocation<ThreadStartParams, ToolResult> {
        return new ThreadStartInvocation(params);
    }
}
