/**
 * Chat Get History Tool - Retrieves chat history for a thread
 * Wraps the SDK's cbchat.getChatHistory() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbchat from '../../modules/chat';

/**
 * Parameters for the ChatGetHistory tool
 */
export interface ChatGetHistoryToolParams {
    /**
     * The thread ID to get chat history for
     */
    threadId: string;
}

class ChatGetHistoryToolInvocation extends BaseToolInvocation<
    ChatGetHistoryToolParams,
    ToolResult
> {
    constructor(params: ChatGetHistoryToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbchat.getChatHistory(this.params.threadId);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved chat history for thread: ${this.params.threadId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting chat history: ${errorMessage}`,
                returnDisplay: `Error getting chat history: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ChatGetHistory tool logic
 */
export class ChatGetHistoryTool extends BaseDeclarativeTool<
    ChatGetHistoryToolParams,
    ToolResult
> {
    static readonly Name: string = 'chat_get_history';

    constructor() {
        super(
            ChatGetHistoryTool.Name,
            'ChatGetHistory',
            `Retrieves the chat history for a specified thread. Returns an array of chat messages representing the conversation history.`,
            Kind.Read,
            {
                properties: {
                    threadId: {
                        description: 'The unique identifier of the thread to retrieve chat history for',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ChatGetHistoryToolParams,
    ): string | null {
        if (!params.threadId || params.threadId.trim() === '') {
            return "The 'threadId' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: ChatGetHistoryToolParams,
    ): ToolInvocation<ChatGetHistoryToolParams, ToolResult> {
        return new ChatGetHistoryToolInvocation(params);
    }
}
