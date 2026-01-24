/**
 * Thread Delete Tool - Deletes a thread
 * Wraps the SDK's threadService.deleteThread() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadDeleteParams {
    /** The thread ID to delete */
    threadId: string;
}

class ThreadDeleteInvocation extends BaseToolInvocation<ThreadDeleteParams, ToolResult> {
    constructor(params: ThreadDeleteParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.deleteThread(this.params.threadId);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Thread deletion failed';
                return {
                    llmContent: `Thread deletion failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Deleted thread: ${this.params.threadId}`,
                returnDisplay: `Deleted thread: ${this.params.threadId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting thread: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadDeleteTool extends BaseDeclarativeTool<ThreadDeleteParams, ToolResult> {
    static readonly Name: string = 'thread_delete';

    constructor() {
        super(
            ThreadDeleteTool.Name,
            'ThreadDelete',
            'Deletes a thread by its ID.',
            Kind.Delete,
            {
                properties: {
                    threadId: {
                        description: 'The ID of the thread to delete.',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadDeleteParams): string | null {
        if (!params.threadId || params.threadId.trim() === '') {
            return "'threadId' is required";
        }
        return null;
    }

    protected createInvocation(params: ThreadDeleteParams): ToolInvocation<ThreadDeleteParams, ToolResult> {
        return new ThreadDeleteInvocation(params);
    }
}
