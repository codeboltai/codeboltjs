/**
 * Thread Create Start Tool - Creates and immediately starts a new thread
 * Wraps the SDK's threadService.createAndStartThread() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadCreateStartParams {
    /** Thread creation and start options */
    options: Record<string, any>;
}

class ThreadCreateStartInvocation extends BaseToolInvocation<ThreadCreateStartParams, ToolResult> {
    constructor(params: ThreadCreateStartParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await threadService.createAndStartThread(this.params.options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Thread creation and start failed';
                return {
                    llmContent: `Thread creation and start failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = 'Created and started thread successfully';
            if (resp.threadId) {
                output += `\n\nThread ID: ${resp.threadId}`;
            }
            if (resp.thread) {
                output += `\n\nThread: ${JSON.stringify(resp.thread, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: 'Thread created and started successfully',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating and starting thread: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadCreateStartTool extends BaseDeclarativeTool<ThreadCreateStartParams, ToolResult> {
    static readonly Name: string = 'thread_create_start';

    constructor() {
        super(
            ThreadCreateStartTool.Name,
            'ThreadCreateStart',
            'Creates and immediately starts a new thread with the specified options.',
            Kind.Execute,
            {
                properties: {
                    options: {
                        description: 'Thread creation and start options object containing thread parameters.',
                        type: 'object',
                    },
                },
                required: ['options'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadCreateStartParams): string | null {
        if (!params.options || typeof params.options !== 'object') {
            return "'options' is required and must be an object";
        }
        return null;
    }

    protected createInvocation(params: ThreadCreateStartParams): ToolInvocation<ThreadCreateStartParams, ToolResult> {
        return new ThreadCreateStartInvocation(params);
    }
}
