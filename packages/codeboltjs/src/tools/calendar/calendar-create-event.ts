/**
 * Calendar Create Event Tool - Creates a new calendar event
 * Wraps the SDK's cbcalendar.createEvent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar, {
    type ICreateEventParams,
    type CalendarEventType,
    type CalendarCheckType,
    type CalendarParticipantType,
    type CalendarParticipant,
} from '../../modules/calendar';

/**
 * Parameters for the CalendarCreateEvent tool
 */
export interface CalendarCreateEventToolParams {
    /**
     * Title of the event
     */
    title: string;

    /**
     * Start time of the event (ISO 8601 format)
     */
    startTime: string;

    /**
     * Optional description of the event
     */
    description?: string;

    /**
     * Type of event: generic, meeting, reminder, deadline, check, milestone
     */
    eventType?: CalendarEventType;

    /**
     * End time of the event (ISO 8601 format)
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
     * ID of the swarm this event belongs to
     */
    swarmId?: string;

    /**
     * List of participants
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

    /**
     * ID of the creator
     */
    createdById?: string;

    /**
     * Name of the creator
     */
    createdByName?: string;

    /**
     * Type of the creator: user, agent, team, swarm
     */
    createdByType?: CalendarParticipantType;

    /**
     * Agent execution ID
     */
    agentExecutionId?: string;

    /**
     * Thread ID
     */
    threadId?: string;
}

class CalendarCreateEventToolInvocation extends BaseToolInvocation<
    CalendarCreateEventToolParams,
    ToolResult
> {
    constructor(params: CalendarCreateEventToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const createParams: ICreateEventParams = {
                title: this.params.title,
                startTime: this.params.startTime,
                description: this.params.description,
                eventType: this.params.eventType,
                endTime: this.params.endTime,
                hasDuration: this.params.hasDuration,
                allDay: this.params.allDay,
                swarmId: this.params.swarmId,
                participants: this.params.participants,
                isRecurring: this.params.isRecurring,
                cronExpression: this.params.cronExpression,
                recurrenceEndTime: this.params.recurrenceEndTime,
                reminder: this.params.reminder,
                agenda: this.params.agenda,
                checkType: this.params.checkType,
                tags: this.params.tags,
                metadata: this.params.metadata,
                createdById: this.params.createdById,
                createdByName: this.params.createdByName,
                createdByType: this.params.createdByType,
                agentExecutionId: this.params.agentExecutionId,
                threadId: this.params.threadId,
            };

            const response = await cbcalendar.createEvent(createParams);

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error creating calendar event: ${errorMsg}`,
                    returnDisplay: `Error creating calendar event: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const event = response.data?.event;
            const eventId = event?.id || 'unknown';
            const eventTitle = event?.title || this.params.title;

            return {
                llmContent: `Successfully created calendar event "${eventTitle}" with ID: ${eventId}\n\nEvent details:\n${JSON.stringify(event, null, 2)}`,
                returnDisplay: `Created calendar event: "${eventTitle}" (ID: ${eventId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating calendar event: ${errorMessage}`,
                returnDisplay: `Error creating calendar event: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarCreateEvent tool
 */
export class CalendarCreateEventTool extends BaseDeclarativeTool<
    CalendarCreateEventToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_create_event';

    constructor() {
        super(
            CalendarCreateEventTool.Name,
            'CalendarCreateEvent',
            `Creates a new calendar event with the specified parameters. Supports various event types including generic, meeting, reminder, deadline, check, and milestone. Can configure recurring events, reminders, participants, and metadata.`,
            Kind.Edit,
            {
                properties: {
                    title: {
                        description: 'Title of the event (required)',
                        type: 'string',
                    },
                    startTime: {
                        description: 'Start time of the event in ISO 8601 format (required)',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the event',
                        type: 'string',
                    },
                    eventType: {
                        description: 'Type of event: generic, meeting, reminder, deadline, check, milestone',
                        type: 'string',
                        enum: ['generic', 'meeting', 'reminder', 'deadline', 'check', 'milestone'],
                    },
                    endTime: {
                        description: 'End time of the event in ISO 8601 format',
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
                    swarmId: {
                        description: 'ID of the swarm this event belongs to',
                        type: 'string',
                    },
                    participants: {
                        description: 'List of participants for the event',
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
                    createdById: {
                        description: 'ID of the creator',
                        type: 'string',
                    },
                    createdByName: {
                        description: 'Name of the creator',
                        type: 'string',
                    },
                    createdByType: {
                        description: 'Type of the creator: user, agent, team, swarm',
                        type: 'string',
                        enum: ['user', 'agent', 'team', 'swarm'],
                    },
                    agentExecutionId: {
                        description: 'Agent execution ID',
                        type: 'string',
                    },
                    threadId: {
                        description: 'Thread ID',
                        type: 'string',
                    },
                },
                required: ['title', 'startTime'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CalendarCreateEventToolParams,
    ): string | null {
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be non-empty.";
        }

        if (!params.startTime || params.startTime.trim() === '') {
            return "The 'startTime' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: CalendarCreateEventToolParams,
    ): ToolInvocation<CalendarCreateEventToolParams, ToolResult> {
        return new CalendarCreateEventToolInvocation(params);
    }
}
