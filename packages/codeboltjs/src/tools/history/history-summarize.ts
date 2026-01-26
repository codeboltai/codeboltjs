/**
 * History Summarize Tool - Summarizes a specific part of the chat history
 * Wraps the SDK's chatSummary.summarize() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { chatSummary } from '../../modules/history';

/**
 * Message object for summarization
 */
export interface SummarizeMessage {
    role: string;
    content: string;
}

/**
 * Parameters for the HistorySummarize tool
 */
export interface HistorySummarizeToolParams {
    /**
     * Array of message objects to summarize
     */
    messages: SummarizeMessage[];
    /**
     * How far back in history to consider
     */
    depth: number;
}

class HistorySummarizeToolInvocation extends BaseToolInvocation<
    HistorySummarizeToolParams,
    ToolResult
> {
    constructor(params: HistorySummarizeToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await chatSummary.summarize(
                this.params.messages,
                this.params.depth
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully summarized ${this.params.messages.length} messages with depth ${this.params.depth}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error summarizing chat history: ${errorMessage}`,
                returnDisplay: `Error summarizing chat history: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the HistorySummarize tool logic
 */
export class HistorySummarizeTool extends BaseDeclarativeTool<
    HistorySummarizeToolParams,
    ToolResult
> {
    static readonly Name: string = 'history_summarize';

    constructor() {
        super(
            HistorySummarizeTool.Name,
            'HistorySummarize',
            `Summarizes a specific part of the chat history. Takes an array of messages and a depth parameter to control how far back in history to consider.`,
            Kind.Read,
            {
                properties: {
                    messages: {
                        description: 'Array of message objects to summarize, each containing role and content',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                role: {
                                    type: 'string',
                                    description: 'The role of the message sender (e.g., "user", "assistant")',
                                },
                                content: {
                                    type: 'string',
                                    description: 'The content of the message',
                                },
                            },
                            required: ['role', 'content'],
                        },
                    },
                    depth: {
                        description: 'How far back in history to consider for summarization',
                        type: 'number',
                    },
                },
                required: ['messages', 'depth'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: HistorySummarizeToolParams,
    ): string | null {
        if (!params.messages || !Array.isArray(params.messages)) {
            return "The 'messages' parameter must be an array.";
        }

        if (params.messages.length === 0) {
            return "The 'messages' parameter must not be empty.";
        }

        for (let i = 0; i < params.messages.length; i++) {
            const msg = params.messages[i];
            if (!msg || typeof msg !== 'object') {
                return `Message at index ${i} must be an object.`;
            }
            if (typeof msg.role !== 'string' || msg.role.trim() === '') {
                return `Message at index ${i} must have a non-empty 'role' string.`;
            }
            if (typeof msg.content !== 'string') {
                return `Message at index ${i} must have a 'content' string.`;
            }
        }

        if (typeof params.depth !== 'number' || !Number.isFinite(params.depth)) {
            return "The 'depth' parameter must be a valid number.";
        }

        if (params.depth < 0) {
            return "The 'depth' parameter must be a non-negative number.";
        }

        return null;
    }

    protected createInvocation(
        params: HistorySummarizeToolParams,
    ): ToolInvocation<HistorySummarizeToolParams, ToolResult> {
        return new HistorySummarizeToolInvocation(params);
    }
}
