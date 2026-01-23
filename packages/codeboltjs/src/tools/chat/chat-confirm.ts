/**
 * Chat Confirm Tool - Sends a confirmation request to the user
 * Wraps the SDK's cbchat.sendConfirmationRequest() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbchat from '../../modules/chat';

/**
 * Parameters for the ChatConfirm tool
 */
export interface ChatConfirmToolParams {
    /**
     * The confirmation message to display
     */
    message: string;

    /**
     * Custom button labels (optional)
     */
    buttons?: string[];

    /**
     * Whether to include feedback option (optional)
     */
    withFeedback?: boolean;
}

class ChatConfirmToolInvocation extends BaseToolInvocation<
    ChatConfirmToolParams,
    ToolResult
> {
    constructor(params: ChatConfirmToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbchat.sendConfirmationRequest(
                this.params.message,
                this.params.buttons || [],
                this.params.withFeedback || false
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Confirmation response received`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error sending confirmation request: ${errorMessage}`,
                returnDisplay: `Error sending confirmation request: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ChatConfirm tool logic
 */
export class ChatConfirmTool extends BaseDeclarativeTool<
    ChatConfirmToolParams,
    ToolResult
> {
    static readonly Name: string = 'chat_confirm';

    constructor() {
        super(
            ChatConfirmTool.Name,
            'ChatConfirm',
            `Sends a confirmation request to the user with customizable buttons. Returns the user's response. Useful for getting user approval before performing actions.`,
            Kind.Execute,
            {
                properties: {
                    message: {
                        description: 'The confirmation message to display to the user',
                        type: 'string',
                    },
                    buttons: {
                        description: 'Optional array of custom button labels for the confirmation dialog',
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    withFeedback: {
                        description: 'Whether to include a feedback option in the confirmation dialog',
                        type: 'boolean',
                    },
                },
                required: ['message'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ChatConfirmToolParams,
    ): string | null {
        if (!params.message || params.message.trim() === '') {
            return "The 'message' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: ChatConfirmToolParams,
    ): ToolInvocation<ChatConfirmToolParams, ToolResult> {
        return new ChatConfirmToolInvocation(params);
    }
}
