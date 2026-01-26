/**
 * History Summarize All Tool - Summarizes entire chat history
 * Wraps the SDK's chatSummary.summarizeAll() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { chatSummary } from '../../modules/history';

/**
 * Parameters for the HistorySummarizeAll tool
 */
export interface HistorySummarizeAllToolParams {
    // No parameters required
}

class HistorySummarizeAllToolInvocation extends BaseToolInvocation<
    HistorySummarizeAllToolParams,
    ToolResult
> {
    constructor(params: HistorySummarizeAllToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await chatSummary.summarizeAll();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully summarized entire chat history',
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
 * Implementation of the HistorySummarizeAll tool logic
 */
export class HistorySummarizeAllTool extends BaseDeclarativeTool<
    HistorySummarizeAllToolParams,
    ToolResult
> {
    static readonly Name: string = 'history_summarize_all';

    constructor() {
        super(
            HistorySummarizeAllTool.Name,
            'HistorySummarizeAll',
            `Summarizes the entire chat history. Returns a summary of all messages in the conversation.`,
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: HistorySummarizeAllToolParams,
    ): ToolInvocation<HistorySummarizeAllToolParams, ToolResult> {
        return new HistorySummarizeAllToolInvocation(params);
    }
}
