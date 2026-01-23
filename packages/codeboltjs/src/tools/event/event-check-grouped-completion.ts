/**
 * Event Check Grouped Completion Tool - Checks if any grouped background agent has completed
 * Wraps the SDK's codeboltEvent.checkForBackgroundGroupedAgentCompletion() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventCheckGroupedCompletion tool
 */
export interface EventCheckGroupedCompletionParams {
    // No parameters required
}

class EventCheckGroupedCompletionInvocation extends BaseToolInvocation<
    EventCheckGroupedCompletionParams,
    ToolResult
> {
    constructor(params: EventCheckGroupedCompletionParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const completion = codeboltEvent.checkForBackgroundGroupedAgentCompletion();

            if (completion === null) {
                return {
                    llmContent: 'No grouped background agent completions available.',
                    returnDisplay: 'No grouped completions',
                };
            }

            let llmContent = `Grouped background agent completion found.\n\n`;
            llmContent += JSON.stringify(completion, null, 2);

            return {
                llmContent,
                returnDisplay: 'Found grouped completion',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error checking for grouped background agent completion: ${errorMessage}`,
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
 * Tool for checking if any grouped background agent has completed
 */
export class EventCheckGroupedCompletionTool extends BaseDeclarativeTool<
    EventCheckGroupedCompletionParams,
    ToolResult
> {
    static readonly Name: string = 'event_check_grouped_completion';

    constructor() {
        super(
            EventCheckGroupedCompletionTool.Name,
            'Check Grouped Agent Completion',
            'Check if any grouped background agent has completed. Returns completion data if available, null otherwise. This is a non-blocking check.',
            Kind.Read,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventCheckGroupedCompletionParams,
    ): ToolInvocation<EventCheckGroupedCompletionParams, ToolResult> {
        return new EventCheckGroupedCompletionInvocation(params);
    }
}
