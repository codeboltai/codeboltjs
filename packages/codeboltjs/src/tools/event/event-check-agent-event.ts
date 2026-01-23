/**
 * Event Check Agent Event Tool - Checks if any agent event has been received
 * Wraps the SDK's codeboltEvent.checkForAgentEventReceived() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventCheckAgentEvent tool
 */
export interface EventCheckAgentEventParams {
    // No parameters required
}

class EventCheckAgentEventInvocation extends BaseToolInvocation<
    EventCheckAgentEventParams,
    ToolResult
> {
    constructor(params: EventCheckAgentEventParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const event = codeboltEvent.checkForAgentEventReceived();

            if (event === null) {
                return {
                    llmContent: 'No agent events available.',
                    returnDisplay: 'No events',
                };
            }

            let llmContent = `Agent event found.\n\n`;
            llmContent += JSON.stringify(event, null, 2);

            return {
                llmContent,
                returnDisplay: 'Found agent event',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error checking for agent event: ${errorMessage}`,
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
 * Tool for checking if any agent event has been received
 */
export class EventCheckAgentEventTool extends BaseDeclarativeTool<
    EventCheckAgentEventParams,
    ToolResult
> {
    static readonly Name: string = 'event_check_agent_event';

    constructor() {
        super(
            EventCheckAgentEventTool.Name,
            'Check for Agent Event',
            'Check if any agent event has been received. Returns event data if available, null otherwise. This is a non-blocking check.',
            Kind.Read,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventCheckAgentEventParams,
    ): ToolInvocation<EventCheckAgentEventParams, ToolResult> {
        return new EventCheckAgentEventInvocation(params);
    }
}
