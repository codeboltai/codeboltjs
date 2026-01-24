/**
 * Event Wait Any Tool - Waits for any external event
 * Wraps the SDK's codeboltEvent.waitForAnyExternalEvent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventWaitAny tool
 */
export interface EventWaitAnyParams {
    // No parameters required
}

class EventWaitAnyInvocation extends BaseToolInvocation<
    EventWaitAnyParams,
    ToolResult
> {
    constructor(params: EventWaitAnyParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const result = await codeboltEvent.waitForAnyExternalEvent();

            if (!result) {
                return {
                    llmContent: 'No external event received.',
                    returnDisplay: 'No event',
                };
            }

            const eventType = result.type;
            const eventData = result.data;

            let llmContent = `External event received.\n`;
            llmContent += `Type: ${eventType}\n\n`;
            llmContent += `Data:\n${JSON.stringify(eventData, null, 2)}`;

            return {
                llmContent,
                returnDisplay: `Received: ${eventType}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error waiting for external event: ${errorMessage}`,
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
export class EventWaitAnyTool extends BaseDeclarativeTool<
    EventWaitAnyParams,
    ToolResult
> {
    static readonly Name: string = 'event_wait_any';

    constructor() {
        super(
            EventWaitAnyTool.Name,
            'Wait for Any External Event',
            'Wait for any external event (Background Completion, Group Completion, or Agent Event). This is a blocking call that resolves when any of these events occur.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventWaitAnyParams,
    ): ToolInvocation<EventWaitAnyParams, ToolResult> {
        return new EventWaitAnyInvocation(params);
    }
}
