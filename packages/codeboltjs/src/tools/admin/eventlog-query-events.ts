/**
 * EventLog Query Events Tool - Queries events from an event log
 * Wraps the SDK's eventLog.queryEvents() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogDSL, EventLogCondition } from '../../types/eventLog';

/**
 * Parameters for the EventLogQueryEvents tool
 */
export interface EventLogQueryEventsToolParams {
    /**
     * The instance ID to query from
     */
    instance_id: string;

    /**
     * Optional stream ID to filter by
     */
    stream_id?: string;

    /**
     * Optional filter conditions
     */
    conditions?: EventLogCondition[];

    /**
     * Optional fields to select
     */
    select?: string[];

    /**
     * Optional order by configuration
     */
    order_by?: {
        field: string;
        direction: 'asc' | 'desc';
    };

    /**
     * Optional limit on number of results
     */
    limit?: number;

    /**
     * Optional offset for pagination
     */
    offset?: number;
}

class EventLogQueryEventsToolInvocation extends BaseToolInvocation<
    EventLogQueryEventsToolParams,
    ToolResult
> {
    constructor(params: EventLogQueryEventsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const query: EventLogDSL = {
                from: {
                    instance: this.params.instance_id,
                    stream: this.params.stream_id,
                },
                where: this.params.conditions,
                select: this.params.select,
                orderBy: this.params.order_by,
                limit: this.params.limit,
                offset: this.params.offset,
            };

            const response = await eventLog.queryEvents(query);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error querying events: ${errorMsg}`,
                    returnDisplay: `Error querying events: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const result = response.data?.result;
            if (!result) {
                return {
                    llmContent: 'No query results returned.',
                    returnDisplay: 'No query results',
                };
            }

            const events = result.events || [];
            let resultContent: string;

            if (events.length === 0) {
                resultContent = `Query Results:\nNo events found matching the query criteria.\nTotal: 0`;
            } else {
                const eventsList = events.map((event, index) =>
                    `${index + 1}. Event ID: ${event.id}\n   Type: ${event.event_type}\n   Stream: ${event.stream_id}\n   Sequence: ${event.sequence_number}\n   Timestamp: ${event.timestamp}\n   Payload: ${JSON.stringify(event.payload, null, 2)}`
                ).join('\n\n');

                resultContent = `Query Results (${events.length} of ${result.total} total):\n\n${eventsList}`;

                if (result.limit && result.offset !== undefined) {
                    resultContent += `\n\nPagination: limit=${result.limit}, offset=${result.offset}`;
                }
            }

            return {
                llmContent: resultContent,
                returnDisplay: `Found ${events.length} event(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error querying events: ${errorMessage}`,
                returnDisplay: `Error querying events: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EventLogQueryEvents tool logic
 */
export class EventLogQueryEventsTool extends BaseDeclarativeTool<
    EventLogQueryEventsToolParams,
    ToolResult
> {
    static readonly Name: string = 'eventlog_query_events';

    constructor() {
        super(
            EventLogQueryEventsTool.Name,
            'EventLogQueryEvents',
            'Queries events from an event log instance using a DSL-based query. Supports filtering by stream, conditions, field selection, ordering, and pagination.',
            Kind.Read,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the event log instance to query',
                        type: 'string',
                    },
                    stream_id: {
                        description: 'Optional stream ID to filter events by',
                        type: 'string',
                    },
                    conditions: {
                        description: 'Optional array of filter conditions. Each condition has field, operator (eq, neq, gt, gte, lt, lte, contains, in, between), and value',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string' },
                                operator: { type: 'string', enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'in', 'between'] },
                                value: {},
                            },
                            required: ['field', 'operator', 'value'],
                        },
                    },
                    select: {
                        description: 'Optional array of fields to select in the result',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    order_by: {
                        description: 'Optional ordering configuration with field and direction (asc or desc)',
                        type: 'object',
                        properties: {
                            field: { type: 'string' },
                            direction: { type: 'string', enum: ['asc', 'desc'] },
                        },
                        required: ['field', 'direction'],
                    },
                    limit: {
                        description: 'Optional maximum number of events to return',
                        type: 'number',
                    },
                    offset: {
                        description: 'Optional offset for pagination',
                        type: 'number',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EventLogQueryEventsToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }

        if (params.limit !== undefined && params.limit <= 0) {
            return "The 'limit' parameter must be a positive number.";
        }

        if (params.offset !== undefined && params.offset < 0) {
            return "The 'offset' parameter must be a non-negative number.";
        }

        return null;
    }

    protected createInvocation(
        params: EventLogQueryEventsToolParams,
    ): ToolInvocation<EventLogQueryEventsToolParams, ToolResult> {
        return new EventLogQueryEventsToolInvocation(params);
    }
}
