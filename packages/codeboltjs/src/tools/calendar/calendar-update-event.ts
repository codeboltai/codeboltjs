/**
 * Calendar Update Event Tool - Updates an existing calendar event
 * Wraps the SDK's cbcalendar.updateEvent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar, {
    type IUpdateEventParams,
    type CalendarEventType,
    type CalendarCheckType,
    type CalendarParticipant,
} from '../../modules/calendar';

/**
 * Parameters for the CalendarUpdateEvent tool
 */
export interface CalendarUpdateEventToolParams {
    /**
     * ID of the event to update (required)
     */
    eventId: string;

    /**
     * New title for the event
     */
    title?: string;

    /**
     * New description for the event
     */
    description?: string;

    /**
     * New event type: generic, meeting, reminder, deadline, check, milestone
     */
    eventType?: CalendarEventType;

    /**
     * New start time (ISO 8601 format)
     */
    startTime?: string;

    /**
     * New end time (ISO 8601 format)
     */
    endTime?: string;

    /**
     * Whether the event has a duration
     */
    hasDuration?: boolean;

    /**
     * Whether this is an all-day event
     */
    allDay?: boolean;

    /**
     * Updated list of participants
     */
    participants?: CalendarParticipant[];

    /**
     * Whether the event is recurring
     */
    isRecurring?: boolean;

    /**
     * Cron expression for recurring events
     */
    cronExpression?: string;

    /**
     * End time for recurrence (ISO 8601 format)
     */
    recurrenceEndTime?: string;

    /**
     * Reminder settings
     */
    reminder?: {
        enabled: boolean;
        minutesBefore: number;
    };

    /**
     * Agenda for meetings
     */
    agenda?: string;

    /**
     * Type of check for check events: email, website, api, file
     */
    checkType?: CalendarCheckType;

    /**
     * Tags for the event
     */
    tags?: string[];

    /**
     * Additional metadata
     */
    metadata?: Record<string, any>;
}

class CalendarUpdateEventToolInvocation extends BaseToolInvocation<
    CalendarUpdateEventToolParams,
    ToolResult
> {
    constructor(params: CalendarUpdateEventToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updateParams: IUpdateEventParams = {
                eventId: this.params.eventId,
                title: this.params.title,
                description: this.params.description,
                eventType: this.params.eventType,
                startTime: this.params.startTime,
                endTime: this.params.endTime,
                hasDuration: this.params.hasDuration,
                allDay: this.params.allDay,
                participants: this.params.participants,
                isRecurring: this.params.isRecurring,
                cronExpression: this.params.cronExpression,
                recurrenceEndTime: this.params.recurrenceEndTime,
                reminder: this.params.reminder,
                agenda: this.params.agenda,
                checkType: this.params.checkType,
                tags: this.params.tags,
                metadata: this.params.metadata,
            };

            const response = await cbcalendar.updateEvent(updateParams);

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error updating calendar event: ${errorMsg}`,
                    returnDisplay: `Error updating calendar event: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const event = response.data?.event;
            const eventTitle = event?.title || 'unknown';

            return {
                llmContent: `Successfully updated calendar event "${eventTitle}" (ID: ${this.params.eventId})\n\nUpdated event details:\n${JSON.stringify(event, null, 2)}`,
                returnDisplay: `Updated calendar event: "${eventTitle}" (ID: ${this.params.eventId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating calendar event: ${errorMessage}`,
                returnDisplay: `Error updating calendar event: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarUpdateEvent tool
 */
export class CalendarUpdateEventTool extends BaseDeclarativeTool<
    CalendarUpdateEventToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_update_event';

    constructor() {
        super(
            CalendarUpdateEventTool.Name,
            'CalendarUpdateEvent',
            `Updates an existing calendar event with new values. Only the fields provided will be updated; other fields remain unchanged. Requires the event ID and at least one field to update.`,
            Kind.Edit,
            {
                properties: {
                    eventId: {
                        description: 'ID of the event to update (required)',
                        type: 'string',
                    },
                    title: {
                        description: 'New title for the event',
                        type: 'string',
                    },
                    description: {
                        description: 'New description for the event',
                        type: 'string',
                    },
                    eventType: {
                        description: 'New event type: generic, meeting, reminder, deadline, check, milestone',
                        type: 'string',
                        enum: ['generic', 'meeting', 'reminder', 'deadline', 'check', 'milestone'],
                    },
                    startTime: {
                        description: 'New start time in ISO 8601 format',
                        type: 'string',
                    },
                    endTime: {
                        description: 'New end time in ISO 8601 format',
                        type: 'string',
                    },
                    hasDuration: {
                        description: 'Whether the event has a duration',
                        type: 'boolean',
                    },
                    allDay: {
                        description: 'Whether this is an all-day event',
                        type: 'boolean',
                    },
                    participants: {
                        description: 'Updated list of participants',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                type: { type: 'string', enum: ['user', 'agent', 'team', 'swarm'] },
                                agentExecutionId: { type: 'string' },
                                threadId: { type: 'string' },
                                status: { type: 'string', enum: ['pending', 'accepted', 'declined'] },
                            },
                            required: ['id', 'name', 'type'],
                        },
                    },
                    isRecurring: {
                        description: 'Whether the event is recurring',
                        type: 'boolean',
                    },
                    cronExpression: {
                        description: 'Cron expression for recurring events',
                        type: 'string',
                    },
                    recurrenceEndTime: {
                        description: 'End time for recurrence in ISO 8601 format',
                        type: 'string',
                    },
                    reminder: {
                        description: 'Reminder settings for the event',
                        type: 'object',
                        properties: {
                            enabled: { type: 'boolean' },
                            minutesBefore: { type: 'number' },
                        },
                        required: ['enabled', 'minutesBefore'],
                    },
                    agenda: {
                        description: 'Agenda for meetings',
                        type: 'string',
                    },
                    checkType: {
                        description: 'Type of check for check events: email, website, api, file',
                        type: 'string',
                        enum: ['email', 'website', 'api', 'file'],
                    },
                    tags: {
                        description: 'Tags for the event',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    metadata: {
                        description: 'Additional metadata as key-value pairs',
                        type: 'object',
                    },
                },
                required: ['eventId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CalendarUpdateEventToolParams,
    ): string | null {
        if (!params.eventId || params.eventId.trim() === '') {
            return "The 'eventId' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: CalendarUpdateEventToolParams,
    ): ToolInvocation<CalendarUpdateEventToolParams, ToolResult> {
        return new CalendarUpdateEventToolInvocation(params);
    }
}
