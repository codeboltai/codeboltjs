/**
 * Chat Send Tool - Sends a message through the chat
 * Wraps the SDK's cbchat.sendMessage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbchat from '../../modules/chat';

/**
 * Parameters for the ChatSend tool
 */
export interface ChatSendToolParams {
    /**
     * The message to send
     */
    message: string;

    /**
     * Additional payload data (optional)
     */
    payload?: object;
}

class ChatSendToolInvocation extends BaseToolInvocation<
    ChatSendToolParams,
    ToolResult
> {
    constructor(params: ChatSendToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbchat.sendMessage(this.params.message, this.params.payload);

            return {
                llmContent: `Message sent successfully: "${this.params.message}"`,
                returnDisplay: `Successfully sent message`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error sending message: ${errorMessage}`,
                returnDisplay: `Error sending message: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ChatSend tool logic
 */
export class ChatSendTool extends BaseDeclarativeTool<
    ChatSendToolParams,
    ToolResult
> {
    static readonly Name: string = 'chat_send';

    constructor() {
        super(
            ChatSendTool.Name,
            'ChatSend',
            `Sends a message through the WebSocket connection. Optionally includes additional payload data with the message.`,
            Kind.Execute,
            {
                properties: {
                    message: {
                        description: 'The message to send',
                        type: 'string',
                    },
                    payload: {
                        description: 'Optional additional payload data to include with the message',
                        type: 'object',
                    },
                },
                required: ['message'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ChatSendToolParams,
    ): string | null {
        if (!params.message || params.message.trim() === '') {
            return "The 'message' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: ChatSendToolParams,
    ): ToolInvocation<ChatSendToolParams, ToolResult> {
        return new ChatSendToolInvocation(params);
    }
}
