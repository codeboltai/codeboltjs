/**
 * Thread Get Messages Tool - Retrieves messages for a specific thread
 * Wraps the SDK's threadService.getThreadMessages() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import threadService from '../../modules/thread';

export interface ThreadGetMessagesParams {
    /** The thread ID to get messages for */
    threadId: string;
    /** Optional limit on number of messages */
    limit?: number;
    /** Optional offset for pagination */
    offset?: number;
    /** Optional: include only messages before this timestamp */
    before?: string;
    /** Optional: include only messages after this timestamp */
    after?: string;
}

class ThreadGetMessagesInvocation extends BaseToolInvocation<ThreadGetMessagesParams, ToolResult> {
    constructor(params: ThreadGetMessagesParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options: Record<string, any> = {
                taskId: this.params.threadId,
            };

            if (this.params.limit !== undefined) {
                options.limit = this.params.limit;
            }
            if (this.params.offset !== undefined) {
                options.offset = this.params.offset;
            }
            if (this.params.before !== undefined) {
                options.before = this.params.before;
            }
            if (this.params.after !== undefined) {
                options.after = this.params.after;
            }

            const response = await threadService.getThreadMessages(options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to retrieve thread messages';
                return {
                    llmContent: `Failed to retrieve thread messages: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resp = response as any;
            let output = `Messages for thread: ${this.params.threadId}`;
            if (resp.messages) {
                output += `\n\nMessages (${resp.messages.length}):\n${JSON.stringify(resp.messages, null, 2)}`;
            } else {
                output += `\n\nResponse: ${JSON.stringify(resp, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Retrieved ${resp.messages?.length || 0} messages`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving thread messages: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class ThreadGetMessagesTool extends BaseDeclarativeTool<ThreadGetMessagesParams, ToolResult> {
    static readonly Name: string = 'thread_get_messages';

    constructor() {
        super(
            ThreadGetMessagesTool.Name,
            'ThreadGetMessages',
            'Retrieves messages for a specific thread with optional pagination.',
            Kind.Read,
            {
                properties: {
                    threadId: {
                        description: 'The ID of the thread to get messages for.',
                        type: 'string',
                    },
                    limit: {
                        description: 'Optional limit on number of messages to retrieve.',
                        type: 'number',
                    },
                    offset: {
                        description: 'Optional offset for pagination.',
                        type: 'number',
                    },
                    before: {
                        description: 'Optional: include only messages before this timestamp.',
                        type: 'string',
                    },
                    after: {
                        description: 'Optional: include only messages after this timestamp.',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: ThreadGetMessagesParams): string | null {
        if (!params.threadId || params.threadId.trim() === '') {
            return "'threadId' is required";
        }
        if (params.limit !== undefined && params.limit < 0) {
            return "'limit' must be a non-negative number";
        }
        if (params.offset !== undefined && params.offset < 0) {
            return "'offset' must be a non-negative number";
        }
        return null;
    }

    protected createInvocation(params: ThreadGetMessagesParams): ToolInvocation<ThreadGetMessagesParams, ToolResult> {
        return new ThreadGetMessagesInvocation(params);
    }
}
