/**
 * Calendar Mark Complete Tool - Marks a calendar event as complete
 * Wraps the SDK's cbcalendar.markEventComplete() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar from '../../modules/calendar';

/**
 * Parameters for the CalendarMarkComplete tool
 */
export interface CalendarMarkCompleteToolParams {
    /**
     * ID of the event to mark as complete (required)
     */
    eventId: string;
}

class CalendarMarkCompleteToolInvocation extends BaseToolInvocation<
    CalendarMarkCompleteToolParams,
    ToolResult
> {
    constructor(params: CalendarMarkCompleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcalendar.markEventComplete({
                eventId: this.params.eventId,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error marking calendar event as complete: ${errorMsg}`,
                    returnDisplay: `Error marking event as complete: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const event = response.data?.event;
            const eventTitle = event?.title || 'unknown';

            return {
                llmContent: `Successfully marked calendar event "${eventTitle}" (ID: ${this.params.eventId}) as complete.\n\nUpdated event details:\n${JSON.stringify(event, null, 2)}`,
                returnDisplay: `Marked event as complete: "${eventTitle}" (ID: ${this.params.eventId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error marking calendar event as complete: ${errorMessage}`,
                returnDisplay: `Error marking event as complete: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarMarkComplete tool
 */
export class CalendarMarkCompleteTool extends BaseDeclarativeTool<
    CalendarMarkCompleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_mark_complete';

    constructor() {
        super(
            CalendarMarkCompleteTool.Name,
            'CalendarMarkComplete',
            `Marks a calendar event as complete. This updates the event's completed status and records the completion timestamp.`,
            Kind.Edit,
            {
                properties: {
                    eventId: {
                        description: 'ID of the event to mark as complete (required)',
                        type: 'string',
                    },
                },
                required: ['eventId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CalendarMarkCompleteToolParams,
    ): string | null {
        if (!params.eventId || params.eventId.trim() === '') {
            return "The 'eventId' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: CalendarMarkCompleteToolParams,
    ): ToolInvocation<CalendarMarkCompleteToolParams, ToolResult> {
        return new CalendarMarkCompleteToolInvocation(params);
    }
}
