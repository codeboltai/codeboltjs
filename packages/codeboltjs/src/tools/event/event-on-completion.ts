/**
 * Event On Completion Tool - Waits for background agent completion
 * Wraps the SDK's codeboltEvent.onBackgroundAgentCompletion() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventOnCompletion tool
 */
export interface EventOnCompletionParams {
    // No parameters required
}

class EventOnCompletionInvocation extends BaseToolInvocation<
    EventOnCompletionParams,
    ToolResult
> {
    constructor(params: EventOnCompletionParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const completion = await codeboltEvent.onBackgroundAgentCompletion();

            if (completion === null) {
                return {
                    llmContent: 'No background agent completion received.',
                    returnDisplay: 'No completion',
                };
            }

            const count = Array.isArray(completion) ? completion.length : 1;
            let llmContent = `Background agent completion received.\n\n`;

            if (Array.isArray(completion)) {
                llmContent += `${count} agent(s) completed:\n`;
                for (let i = 0; i < completion.length; i++) {
                    llmContent += `\nCompletion ${i + 1}:\n`;
                    llmContent += JSON.stringify(completion[i], null, 2) + '\n';
                }
            } else {
                llmContent += JSON.stringify(completion, null, 2);
            }

            return {
                llmContent,
                returnDisplay: `Received ${count} completion(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error waiting for background agent completion: ${errorMessage}`,
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
 * Tool for waiting for background agent completion
 */
export class EventOnCompletionTool extends BaseDeclarativeTool<
    EventOnCompletionParams,
    ToolResult
> {
    static readonly Name: string = 'event_on_completion';

    constructor() {
        super(
            EventOnCompletionTool.Name,
            'Wait for Background Agent Completion',
            'Wait for a background agent to complete. This is a blocking call that resolves when an agent completes.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventOnCompletionParams,
    ): ToolInvocation<EventOnCompletionParams, ToolResult> {
        return new EventOnCompletionInvocation(params);
    }
}
