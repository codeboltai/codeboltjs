/**
 * Calendar List Events Tool - Lists calendar events with optional filters
 * Wraps the SDK's cbcalendar.listEvents() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar, {
    type IListEventsParams,
    type CalendarEventType,
} from '../../modules/calendar';

/**
 * Parameters for the CalendarListEvents tool
 */
export interface CalendarListEventsToolParams {
    /**
     * Start date for filtering events (ISO 8601 format)
     */
    startDate?: string;

    /**
     * End date for filtering events (ISO 8601 format)
     */
    endDate?: string;

    /**
     * Filter by event types
     */
    eventTypes?: CalendarEventType[];

    /**
     * Filter by creator ID
     */
    creatorId?: string;

    /**
     * Filter by participant ID
     */
    participantId?: string;

    /**
     * Filter by swarm ID
     */
    swarmId?: string;

    /**
     * Include recurrences in the results
     */
    includeRecurrences?: boolean;

    /**
     * Filter by tags
     */
    tags?: string[];

    /**
     * Search query string
     */
    search?: string;

    /**
     * Filter by completion status
     */
    completed?: boolean;

    /**
     * Include completed events in results
     */
    includeCompleted?: boolean;

    /**
     * Only return triggered events (start time has passed)
     */
    onlyTriggered?: boolean;
}

class CalendarListEventsToolInvocation extends BaseToolInvocation<
    CalendarListEventsToolParams,
    ToolResult
> {
    constructor(params: CalendarListEventsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const listParams: IListEventsParams = {
                startDate: this.params.startDate,
                endDate: this.params.endDate,
                eventTypes: this.params.eventTypes,
                creatorId: this.params.creatorId,
                participantId: this.params.participantId,
                swarmId: this.params.swarmId,
                includeRecurrences: this.params.includeRecurrences,
                tags: this.params.tags,
                search: this.params.search,
                completed: this.params.completed,
                includeCompleted: this.params.includeCompleted,
                onlyTriggered: this.params.onlyTriggered,
            };

            const response = await cbcalendar.listEvents(listParams);

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing calendar events: ${errorMsg}`,
                    returnDisplay: `Error listing calendar events: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const events = response.data?.events || [];
            const count = response.data?.count || events.length;

            if (events.length === 0) {
                return {
                    llmContent: 'No calendar events found matching the specified filters.',
                    returnDisplay: 'No events found',
                };
            }

            const eventSummaries = events.map((event: any) => ({
                id: event.id,
                title: event.title,
                eventType: event.eventType,
                startTime: event.startTime,
                endTime: event.endTime,
                completed: event.completed,
            }));

            return {
                llmContent: `Found ${count} calendar event(s):\n\n${JSON.stringify(eventSummaries, null, 2)}\n\nFull event details:\n${JSON.stringify(events, null, 2)}`,
                returnDisplay: `Found ${count} calendar event(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing calendar events: ${errorMessage}`,
                returnDisplay: `Error listing calendar events: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarListEvents tool
 */
export class CalendarListEventsTool extends BaseDeclarativeTool<
    CalendarListEventsToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_list_events';

    constructor() {
        super(
            CalendarListEventsTool.Name,
            'CalendarListEvents',
            `Lists calendar events with optional filters. Can filter by date range, event types, creator, participant, swarm, tags, search query, and completion status.`,
            Kind.Read,
            {
                properties: {
                    startDate: {
                        description: 'Start date for filtering events in ISO 8601 format',
                        type: 'string',
                    },
                    endDate: {
                        description: 'End date for filtering events in ISO 8601 format',
                        type: 'string',
                    },
                    eventTypes: {
                        description: 'Filter by event types',
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['generic', 'meeting', 'reminder', 'deadline', 'check', 'milestone'],
                        },
                    },
                    creatorId: {
                        description: 'Filter by creator ID',
                        type: 'string',
                    },
                    participantId: {
                        description: 'Filter by participant ID',
                        type: 'string',
                    },
                    swarmId: {
                        description: 'Filter by swarm ID',
                        type: 'string',
                    },
                    includeRecurrences: {
                        description: 'Include recurrences in the results',
                        type: 'boolean',
                    },
                    tags: {
                        description: 'Filter by tags',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    search: {
                        description: 'Search query string to filter events',
                        type: 'string',
                    },
                    completed: {
                        description: 'Filter by completion status (true for completed, false for incomplete)',
                        type: 'boolean',
                    },
                    includeCompleted: {
                        description: 'Include completed events in results (default behavior may exclude them)',
                        type: 'boolean',
                    },
                    onlyTriggered: {
                        description: 'Only return triggered events (events whose start time has passed)',
                        type: 'boolean',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: CalendarListEventsToolParams,
    ): ToolInvocation<CalendarListEventsToolParams, ToolResult> {
        return new CalendarListEventsToolInvocation(params);
    }
}
