/**
 * Event Wait For External Event Tool
 * 
 * Waits for any external event (Background Completion, Group Completion, Agent Event).
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for waiting for external event (none required)
 */
export interface EventWaitForExternalEventParams {
}

class EventWaitForExternalEventInvocation extends BaseToolInvocation<EventWaitForExternalEventParams, ToolResult> {
    constructor(params: EventWaitForExternalEventParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const event = await cbcodeboltEvent.waitForAnyExternalEvent();

            return {
                llmContent: `External event received: ${event.type}`,
                returnDisplay: `Event: ${event.type}`,
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
 * Tool for waiting for any external event
 */
export class EventWaitForExternalEventTool extends BaseDeclarativeTool<EventWaitForExternalEventParams, ToolResult> {
    constructor() {
        super(
            'event_wait_for_external_event',
            'Wait for External Event',
            'Waits for any external event (Background Completion, Group Completion, or Agent Event). Returns the event type and data.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: EventWaitForExternalEventParams): ToolInvocation<EventWaitForExternalEventParams, ToolResult> {
        return new EventWaitForExternalEventInvocation(params);
    }
}
