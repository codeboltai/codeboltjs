/**
 * Chat Ask Tool - Asks a question to the user
 * Wraps the SDK's cbchat.askQuestion() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbchat from '../../modules/chat';

/**
 * Parameters for the ChatAsk tool
 */
export interface ChatAskToolParams {
    /**
     * The question to ask the user
     */
    question: string;

    /**
     * Custom button labels (optional)
     */
    buttons?: string[];

    /**
     * Whether to include feedback option (optional)
     */
    withFeedback?: boolean;
}

class ChatAskToolInvocation extends BaseToolInvocation<
    ChatAskToolParams,
    ToolResult
> {
    constructor(params: ChatAskToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbchat.askQuestion(
                this.params.question,
                this.params.buttons || [],
                this.params.withFeedback || false
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Question response received`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error asking question: ${errorMessage}`,
                returnDisplay: `Error asking question: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ChatAsk tool logic
 */
export class ChatAskTool extends BaseDeclarativeTool<
    ChatAskToolParams,
    ToolResult
> {
    static readonly Name: string = 'chat_ask';

    constructor() {
        super(
            ChatAskTool.Name,
            'ChatAsk',
            `Asks a question to the user with customizable buttons. Returns the user's response. Useful for gathering input or making decisions.`,
            Kind.Execute,
            {
                properties: {
                    question: {
                        description: 'The question to ask the user',
                        type: 'string',
                    },
                    buttons: {
                        description: 'Optional array of custom button labels for response options',
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    withFeedback: {
                        description: 'Whether to include a feedback option with the question',
                        type: 'boolean',
                    },
                },
                required: ['question'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ChatAskToolParams,
    ): string | null {
        if (!params.question || params.question.trim() === '') {
            return "The 'question' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: ChatAskToolParams,
    ): ToolInvocation<ChatAskToolParams, ToolResult> {
        return new ChatAskToolInvocation(params);
    }
}
