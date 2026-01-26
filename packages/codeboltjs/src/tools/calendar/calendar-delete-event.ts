/**
 * Calendar Delete Event Tool - Deletes a calendar event
 * Wraps the SDK's cbcalendar.deleteEvent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar from '../../modules/calendar';

/**
 * Parameters for the CalendarDeleteEvent tool
 */
export interface CalendarDeleteEventToolParams {
    /**
     * ID of the event to delete (required)
     */
    eventId: string;
}

class CalendarDeleteEventToolInvocation extends BaseToolInvocation<
    CalendarDeleteEventToolParams,
    ToolResult
> {
    constructor(params: CalendarDeleteEventToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcalendar.deleteEvent({
                eventId: this.params.eventId,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error deleting calendar event: ${errorMsg}`,
                    returnDisplay: `Error deleting calendar event: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted calendar event with ID: ${this.params.eventId}`,
                returnDisplay: `Deleted calendar event (ID: ${this.params.eventId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting calendar event: ${errorMessage}`,
                returnDisplay: `Error deleting calendar event: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarDeleteEvent tool
 */
export class CalendarDeleteEventTool extends BaseDeclarativeTool<
    CalendarDeleteEventToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_delete_event';

    constructor() {
        super(
            CalendarDeleteEventTool.Name,
            'CalendarDeleteEvent',
            `Deletes a calendar event by its ID. This action is permanent and cannot be undone.`,
            Kind.Delete,
            {
                properties: {
                    eventId: {
                        description: 'ID of the event to delete (required)',
                        type: 'string',
                    },
                },
                required: ['eventId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CalendarDeleteEventToolParams,
    ): string | null {
        if (!params.eventId || params.eventId.trim() === '') {
            return "The 'eventId' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: CalendarDeleteEventToolParams,
    ): ToolInvocation<CalendarDeleteEventToolParams, ToolResult> {
        return new CalendarDeleteEventToolInvocation(params);
    }
}
