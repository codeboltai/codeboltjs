/**
 * Event On Grouped Completion Tool - Waits for grouped background agent completion
 * Wraps the SDK's codeboltEvent.onBackgroundGroupedAgentCompletion() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventOnGroupedCompletion tool
 */
export interface EventOnGroupedCompletionParams {
    // No parameters required
}

class EventOnGroupedCompletionInvocation extends BaseToolInvocation<
    EventOnGroupedCompletionParams,
    ToolResult
> {
    constructor(params: EventOnGroupedCompletionParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const completion = await codeboltEvent.onBackgroundGroupedAgentCompletion();

            if (completion === null) {
                return {
                    llmContent: 'No grouped background agent completion received.',
                    returnDisplay: 'No grouped completion',
                };
            }

            let llmContent = `Grouped background agent completion received.\n\n`;
            llmContent += JSON.stringify(completion, null, 2);

            return {
                llmContent,
                returnDisplay: 'Received grouped completion',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error waiting for grouped background agent completion: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for waiting for grouped background agent completion
 */
export class EventOnGroupedCompletionTool extends BaseDeclarativeTool<
    EventOnGroupedCompletionParams,
    ToolResult
> {
    static readonly Name: string = 'event_on_grouped_completion';

    constructor() {
        super(
            EventOnGroupedCompletionTool.Name,
            'Wait for Grouped Agent Completion',
            'Wait for a grouped background agent to complete. This is a blocking call that resolves when a grouped agent completes.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventOnGroupedCompletionParams,
    ): ToolInvocation<EventOnGroupedCompletionParams, ToolResult> {
        return new EventOnGroupedCompletionInvocation(params);
    }
}
