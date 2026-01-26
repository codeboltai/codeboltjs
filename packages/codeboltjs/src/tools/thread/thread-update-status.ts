/**
 * Thread Update Status Tool - Updates the status of a thread
 * Wraps the SDK's threadService.updateThreadStatus() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadUpdateStatusParams {
    /** The thread ID to update status for */
    threadId: string;
    /** The new status for the thread */
    status: string;
}

class ThreadUpdateStatusInvocation extends BaseToolInvocation<ThreadUpdateStatusParams, ToolResult> {
    constructor(params: ThreadUpdateStatusParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.updateThreadStatus(this.params.threadId, this.params.status);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Thread status update failed';
                return {
                    llmContent: `Thread status update failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = `Updated thread status: ${this.params.threadId} -> ${this.params.status}`;
            if (resp.thread) {
                output += `\n\nThread: ${JSON.stringify(resp.thread, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Updated status to: ${this.params.status}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating thread status: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadUpdateStatusTool extends BaseDeclarativeTool<ThreadUpdateStatusParams, ToolResult> {
    static readonly Name: string = 'thread_update_status';

    constructor() {
        super(
            ThreadUpdateStatusTool.Name,
            'ThreadUpdateStatus',
            'Updates the status of a thread.',
            Kind.Edit,
            {
                properties: {
                    threadId: {
                        description: 'The ID of the thread to update status for.',
                        type: 'string',
                    },
                    status: {
                        description: 'The new status for the thread.',
                        type: 'string',
                    },
                },
                required: ['threadId', 'status'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadUpdateStatusParams): string | null {
        if (!params.threadId || params.threadId.trim() === '') {
            return "'threadId' is required";
        }
        if (!params.status || params.status.trim() === '') {
            return "'status' is required";
        }
        return null;
    }

    protected createInvocation(params: ThreadUpdateStatusParams): ToolInvocation<ThreadUpdateStatusParams, ToolResult> {
        return new ThreadUpdateStatusInvocation(params);
    }
}
