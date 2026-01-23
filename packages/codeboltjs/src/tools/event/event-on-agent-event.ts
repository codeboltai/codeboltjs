/**
 * Event On Agent Event Tool - Waits for an agent event
 * Wraps the SDK's codeboltEvent.onAgentEventReceived() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventOnAgentEvent tool
 */
export interface EventOnAgentEventParams {
    // No parameters required
}

class EventOnAgentEventInvocation extends BaseToolInvocation<
    EventOnAgentEventParams,
    ToolResult
> {
    constructor(params: EventOnAgentEventParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const event = await codeboltEvent.onAgentEventReceived();

            if (event === null) {
                return {
                    llmContent: 'No agent event received.',
                    returnDisplay: 'No event',
                };
            }

            let llmContent = `Agent event received.\n\n`;
            llmContent += JSON.stringify(event, null, 2);

            return {
                llmContent,
                returnDisplay: 'Received agent event',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error waiting for agent event: ${errorMessage}`,
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
 * Tool for waiting for an agent event
 */
export class EventOnAgentEventTool extends BaseDeclarativeTool<
    EventOnAgentEventParams,
    ToolResult
> {
    static readonly Name: string = 'event_on_agent_event';

    constructor() {
        super(
            EventOnAgentEventTool.Name,
            'Wait for Agent Event',
            'Wait for an agent event to be received. This is a blocking call that resolves when an agent event arrives.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventOnAgentEventParams,
    ): ToolInvocation<EventOnAgentEventParams, ToolResult> {
        return new EventOnAgentEventInvocation(params);
    }
}
