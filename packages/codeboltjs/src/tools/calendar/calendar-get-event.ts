/**
 * Calendar Get Event Tool - Retrieves a single calendar event by ID
 * Wraps the SDK's cbcalendar.getEvent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar from '../../modules/calendar';

/**
 * Parameters for the CalendarGetEvent tool
 */
export interface CalendarGetEventToolParams {
    /**
     * ID of the event to retrieve (required)
     */
    eventId: string;
}

class CalendarGetEventToolInvocation extends BaseToolInvocation<
    CalendarGetEventToolParams,
    ToolResult
> {
    constructor(params: CalendarGetEventToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcalendar.getEvent({
                eventId: this.params.eventId,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error retrieving calendar event: ${errorMsg}`,
                    returnDisplay: `Error retrieving calendar event: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const event = response.data?.event;

            if (!event) {
                return {
                    llmContent: `Calendar event not found with ID: ${this.params.eventId}`,
                    returnDisplay: `Event not found (ID: ${this.params.eventId})`,
                    error: {
                        message: 'Event not found',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Calendar event details:\n${JSON.stringify(event, null, 2)}`,
                returnDisplay: `Retrieved calendar event: "${event.title}" (ID: ${event.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving calendar event: ${errorMessage}`,
                returnDisplay: `Error retrieving calendar event: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarGetEvent tool
 */
export class CalendarGetEventTool extends BaseDeclarativeTool<
    CalendarGetEventToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_get_event';

    constructor() {
        super(
            CalendarGetEventTool.Name,
            'CalendarGetEvent',
            `Retrieves a single calendar event by its ID. Returns the full event details including title, description, times, participants, and all other properties.`,
            Kind.Read,
            {
                properties: {
                    eventId: {
                        description: 'ID of the event to retrieve (required)',
                        type: 'string',
                    },
                },
                required: ['eventId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CalendarGetEventToolParams,
    ): string | null {
        if (!params.eventId || params.eventId.trim() === '') {
            return "The 'eventId' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: CalendarGetEventToolParams,
    ): ToolInvocation<CalendarGetEventToolParams, ToolResult> {
        return new CalendarGetEventToolInvocation(params);
    }
}
