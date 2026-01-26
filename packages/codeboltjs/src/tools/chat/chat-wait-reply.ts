/**
 * Chat Wait Reply Tool - Waits for a reply to a message
 * Wraps the SDK's cbchat.waitforReply() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbchat from '../../modules/chat';

/**
 * Parameters for the ChatWaitReply tool
 */
export interface ChatWaitReplyToolParams {
    /**
     * The message for which a reply is expected
     */
    message: string;
}

class ChatWaitReplyToolInvocation extends BaseToolInvocation<
    ChatWaitReplyToolParams,
    ToolResult
> {
    constructor(params: ChatWaitReplyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbchat.waitforReply(this.params.message);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully received reply`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error waiting for reply: ${errorMessage}`,
                returnDisplay: `Error waiting for reply: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ChatWaitReply tool logic
 */
export class ChatWaitReplyTool extends BaseDeclarativeTool<
    ChatWaitReplyToolParams,
    ToolResult
> {
    static readonly Name: string = 'chat_wait_reply';

    constructor() {
        super(
            ChatWaitReplyTool.Name,
            'ChatWaitReply',
            `Waits for a reply to a sent message. Returns the user's reply when received.`,
            Kind.Execute,
            {
                properties: {
                    message: {
                        description: 'The message for which a reply is expected',
                        type: 'string',
                    },
                },
                required: ['message'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ChatWaitReplyToolParams,
    ): string | null {
        if (!params.message || params.message.trim() === '') {
            return "The 'message' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: ChatWaitReplyToolParams,
    ): ToolInvocation<ChatWaitReplyToolParams, ToolResult> {
        return new ChatWaitReplyToolInvocation(params);
    }
}
