/**
 * Thread Update Tool - Updates an existing thread
 * Wraps the SDK's threadService.updateThread() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadUpdateParams {
    /** The thread ID to update */
    threadId: string;
    /** The updates to apply to the thread */
    updates: Record<string, any>;
}

class ThreadUpdateInvocation extends BaseToolInvocation<ThreadUpdateParams, ToolResult> {
    constructor(params: ThreadUpdateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.updateThread(this.params.threadId, this.params.updates);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Thread update failed';
                return {
                    llmContent: `Thread update failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = `Updated thread: ${this.params.threadId}`;
            if (resp.thread) {
                output += `\n\nThread: ${JSON.stringify(resp.thread, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Updated thread: ${this.params.threadId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating thread: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadUpdateTool extends BaseDeclarativeTool<ThreadUpdateParams, ToolResult> {
    static readonly Name: string = 'thread_update';

    constructor() {
        super(
            ThreadUpdateTool.Name,
            'ThreadUpdate',
            'Updates an existing thread with the specified changes.',
            Kind.Edit,
            {
                properties: {
                    threadId: {
                        description: 'The ID of the thread to update.',
                        type: 'string',
                    },
                    updates: {
                        description: 'The updates to apply to the thread.',
                        type: 'object',
                    },
                },
                required: ['threadId', 'updates'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadUpdateParams): string | null {
        if (!params.threadId || params.threadId.trim() === '') {
            return "'threadId' is required";
        }
        if (!params.updates || typeof params.updates !== 'object') {
            return "'updates' is required and must be an object";
        }
        return null;
    }

    protected createInvocation(params: ThreadUpdateParams): ToolInvocation<ThreadUpdateParams, ToolResult> {
        return new ThreadUpdateInvocation(params);
    }
}
