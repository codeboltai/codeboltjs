/**
 * Event Get Running Agent Count Tool - Gets the number of currently running background agents
 * Wraps the SDK's codeboltEvent.getRunningAgentCount() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventGetRunningCount tool
 */
export interface EventGetRunningCountParams {
    // No parameters required
}

class EventGetRunningCountInvocation extends BaseToolInvocation<
    EventGetRunningCountParams,
    ToolResult
> {
    constructor(params: EventGetRunningCountParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const count = codeboltEvent.getRunningAgentCount();

            return {
                llmContent: `Currently running background agents: ${count}`,
                returnDisplay: `Running agents: ${count}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting running agent count: ${errorMessage}`,
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
 * Tool for getting the number of currently running background agents
 */
export class EventGetRunningCountTool extends BaseDeclarativeTool<
    EventGetRunningCountParams,
    ToolResult
> {
    static readonly Name: string = 'event_get_running_count';

    constructor() {
        super(
            EventGetRunningCountTool.Name,
            'Get Running Agent Count',
            'Get the number of currently running background agents.',
            Kind.Read,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventGetRunningCountParams,
    ): ToolInvocation<EventGetRunningCountParams, ToolResult> {
        return new EventGetRunningCountInvocation(params);
    }
}
