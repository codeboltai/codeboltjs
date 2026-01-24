/**
 * Event Check Background Agent Completion Tool
 * 
 * Checks if any background agent has completed (non-blocking).
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for checking background agent completion (none required)
 */
export interface EventCheckBackgroundAgentCompletionParams {
}

class EventCheckBackgroundAgentCompletionInvocation extends BaseToolInvocation<EventCheckBackgroundAgentCompletionParams, ToolResult> {
    constructor(params: EventCheckBackgroundAgentCompletionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const completion = cbcodeboltEvent.checkForBackgroundAgentCompletion();

            if (completion) {
                const count = Array.isArray(completion) ? completion.length : 1;
                return {
                    llmContent: `Found ${count} completed background agent(s)`,
                    returnDisplay: `Found ${count} completed agent(s)`,
                };
            } else {
                return {
                    llmContent: 'No completed background agents found',
                    returnDisplay: 'No completed agents',
                };
            }
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
 * Tool for checking background agent completion
 */
export class EventCheckBackgroundAgentCompletionTool extends BaseDeclarativeTool<EventCheckBackgroundAgentCompletionParams, ToolResult> {
    constructor() {
        super(
            'event_check_background_agent_completion',
            'Check Background Agent Completion',
            'Checks if any background agent has completed (non-blocking). Returns completion data if available, or null.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: EventCheckBackgroundAgentCompletionParams): ToolInvocation<EventCheckBackgroundAgentCompletionParams, ToolResult> {
        return new EventCheckBackgroundAgentCompletionInvocation(params);
    }
}
