/**
 * Calendar Get Upcoming Events Tool - Retrieves upcoming calendar events
 * Wraps the SDK's cbcalendar.getUpcomingEvents() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar from '../../modules/calendar';

/**
 * Parameters for the CalendarGetUpcoming tool
 */
export interface CalendarGetUpcomingToolParams {
    /**
     * Number of minutes to look ahead (optional, defaults to 60)
     */
    withinMinutes?: number;
}

class CalendarGetUpcomingToolInvocation extends BaseToolInvocation<
    CalendarGetUpcomingToolParams,
    ToolResult
> {
    constructor(params: CalendarGetUpcomingToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcalendar.getUpcomingEvents({
                withinMinutes: this.params.withinMinutes,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error retrieving upcoming calendar events: ${errorMsg}`,
                    returnDisplay: `Error retrieving upcoming events: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const events = response.data?.events || [];
            const count = response.data?.count || events.length;
            const withinMinutes = this.params.withinMinutes || 60;

            if (events.length === 0) {
                return {
                    llmContent: `No upcoming calendar events within the next ${withinMinutes} minutes.`,
                    returnDisplay: `No upcoming events within ${withinMinutes} minutes`,
                };
            }

            const eventSummaries = events.map((event: any) => ({
                id: event.id,
                title: event.title,
                eventType: event.eventType,
                startTime: event.startTime,
                endTime: event.endTime,
            }));

            return {
                llmContent: `Found ${count} upcoming calendar event(s) within the next ${withinMinutes} minutes:\n\n${JSON.stringify(eventSummaries, null, 2)}\n\nFull event details:\n${JSON.stringify(events, null, 2)}`,
                returnDisplay: `Found ${count} upcoming event(s) within ${withinMinutes} minutes`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving upcoming calendar events: ${errorMessage}`,
                returnDisplay: `Error retrieving upcoming events: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarGetUpcoming tool
 */
export class CalendarGetUpcomingTool extends BaseDeclarativeTool<
    CalendarGetUpcomingToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_get_upcoming';

    constructor() {
        super(
            CalendarGetUpcomingTool.Name,
            'CalendarGetUpcoming',
            `Retrieves upcoming calendar events within a specified time window. By default, returns events within the next 60 minutes. Use the withinMinutes parameter to adjust the time window.`,
            Kind.Read,
            {
                properties: {
                    withinMinutes: {
                        description: 'Number of minutes to look ahead for upcoming events (optional, defaults to 60)',
                        type: 'number',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CalendarGetUpcomingToolParams,
    ): string | null {
        if (params.withinMinutes !== undefined && params.withinMinutes <= 0) {
            return "The 'withinMinutes' parameter must be a positive number.";
        }

        return null;
    }

    protected createInvocation(
        params: CalendarGetUpcomingToolParams,
    ): ToolInvocation<CalendarGetUpcomingToolParams, ToolResult> {
        return new CalendarGetUpcomingToolInvocation(params);
    }
}
