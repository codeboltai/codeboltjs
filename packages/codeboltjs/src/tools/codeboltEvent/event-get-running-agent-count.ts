/**
 * Event Get Running Agent Count Tool
 * 
 * Gets the number of currently running background agents.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for getting running agent count (none required)
 */
export interface EventGetRunningAgentCountParams {
}

class EventGetRunningAgentCountInvocation extends BaseToolInvocation<EventGetRunningAgentCountParams, ToolResult> {
    constructor(params: EventGetRunningAgentCountParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const count = cbcodeboltEvent.getRunningAgentCount();

            return {
                llmContent: `Currently ${count} running background agents`,
                returnDisplay: `${count} running agents`,
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
 * Tool for getting running agent count
 */
export class EventGetRunningAgentCountTool extends BaseDeclarativeTool<EventGetRunningAgentCountParams, ToolResult> {
    constructor() {
        super(
            'event_get_running_agent_count',
            'Get Running Agent Count',
            'Gets the number of currently running background agents.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: EventGetRunningAgentCountParams): ToolInvocation<EventGetRunningAgentCountParams, ToolResult> {
        return new EventGetRunningAgentCountInvocation(params);
    }
}
