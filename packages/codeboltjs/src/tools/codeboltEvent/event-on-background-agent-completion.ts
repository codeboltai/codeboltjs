/**
 * Event On Background Agent Completion Tool
 * 
 * Waits for background agent completion (blocking).
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for waiting for background agent completion (none required)
 */
export interface EventOnBackgroundAgentCompletionParams {
}

class EventOnBackgroundAgentCompletionInvocation extends BaseToolInvocation<EventOnBackgroundAgentCompletionParams, ToolResult> {
    constructor(params: EventOnBackgroundAgentCompletionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const completion = await cbcodeboltEvent.onBackgroundAgentCompletion();

            const count = Array.isArray(completion) ? completion.length : 1;
            return {
                llmContent: `Background agent(s) completed: ${count} agent(s)`,
                returnDisplay: `${count} agent(s) completed`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
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
export class EventOnBackgroundAgentCompletionTool extends BaseDeclarativeTool<EventOnBackgroundAgentCompletionParams, ToolResult> {
    constructor() {
        super(
            'event_on_background_agent_completion',
            'Wait for Background Agent Completion',
            'Waits for background agent completion (blocking). Returns when an agent completes.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: EventOnBackgroundAgentCompletionParams): ToolInvocation<EventOnBackgroundAgentCompletionParams, ToolResult> {
        return new EventOnBackgroundAgentCompletionInvocation(params);
    }
}
