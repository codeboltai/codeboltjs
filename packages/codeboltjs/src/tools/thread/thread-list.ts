/**
 * Thread List Tool - Retrieves a list of threads
 * Wraps the SDK's threadService.getThreadList() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadListParams {
    /** Optional filtering options */
    options?: Record<string, any>;
}

class ThreadListInvocation extends BaseToolInvocation<ThreadListParams, ToolResult> {
    constructor(params: ThreadListParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.getThreadList(this.params.options || {});

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to retrieve thread list';
                return {
                    llmContent: `Failed to retrieve thread list: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = 'Thread list retrieved successfully';
            if (resp.threads) {
                output += `\n\nThreads (${resp.threads.length}):\n${JSON.stringify(resp.threads, null, 2)}`;
            } else {
                output += `\n\nResponse: ${JSON.stringify(resp, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Retrieved ${resp.threads?.length || 0} threads`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving thread list: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadListTool extends BaseDeclarativeTool<ThreadListParams, ToolResult> {
    static readonly Name: string = 'thread_list';

    constructor() {
        super(
            ThreadListTool.Name,
            'ThreadList',
            'Retrieves a list of threads with optional filtering.',
            Kind.Read,
            {
                properties: {
                    options: {
                        description: 'Optional filtering options for the thread list.',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadListParams): string | null {
        if (params.options !== undefined && typeof params.options !== 'object') {
            return "'options' must be an object if provided";
        }
        return null;
    }

    protected createInvocation(params: ThreadListParams): ToolInvocation<ThreadListParams, ToolResult> {
        return new ThreadListInvocation(params);
    }
}
