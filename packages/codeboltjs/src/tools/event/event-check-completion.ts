/**
 * Event Check Completion Tool - Checks if any background agent has completed
 * Wraps the SDK's codeboltEvent.checkForBackgroundAgentCompletion() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventCheckCompletion tool
 */
export interface EventCheckCompletionParams {
    // No parameters required
}

class EventCheckCompletionInvocation extends BaseToolInvocation<
    EventCheckCompletionParams,
    ToolResult
> {
    constructor(params: EventCheckCompletionParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const completions = codeboltEvent.checkForBackgroundAgentCompletion();

            if (completions === null) {
                return {
                    llmContent: 'No background agent completions available.',
                    returnDisplay: 'No completions',
                };
            }

            const count = Array.isArray(completions) ? completions.length : 1;
            let llmContent = `Found ${count} background agent completion(s).\n\n`;

            if (Array.isArray(completions)) {
                for (let i = 0; i < completions.length; i++) {
                    const completion = completions[i];
                    llmContent += `Completion ${i + 1}:\n`;
                    llmContent += JSON.stringify(completion, null, 2) + '\n\n';
                }
            } else {
                llmContent += JSON.stringify(completions, null, 2);
            }

            return {
                llmContent,
                returnDisplay: `Found ${count} completion(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error checking for background agent completion: ${errorMessage}`,
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
 * Tool for checking if any background agent has completed
 */
export class EventCheckCompletionTool extends BaseDeclarativeTool<
    EventCheckCompletionParams,
    ToolResult
> {
    static readonly Name: string = 'event_check_completion';

    constructor() {
        super(
            EventCheckCompletionTool.Name,
            'Check Background Agent Completion',
            'Check if any background agent has completed. Returns completion data if available, null otherwise. This is a non-blocking check.',
            Kind.Read,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventCheckCompletionParams,
    ): ToolInvocation<EventCheckCompletionParams, ToolResult> {
        return new EventCheckCompletionInvocation(params);
    }
}
