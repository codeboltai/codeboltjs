import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogQueryResponse, EventLogDSL } from '../../types/eventLog';

export interface EventLogQueryEventsParams {
    query: EventLogDSL;
}

class EventLogQueryEventsInvocation extends BaseToolInvocation<EventLogQueryEventsParams, ToolResult> {
    constructor(params: EventLogQueryEventsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogQueryResponse = await eventLog.queryEvents(this.params.query);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to query events'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to query events'}`,
                    error: { message: response.error || response.message || 'Failed to query events', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const result = response.data.result;
            return {
                llmContent: `Query returned ${result.events?.length || 0} event(s) out of ${result.total} total`,
                returnDisplay: JSON.stringify(result, null, 2),
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class EventLogQueryEventsTool extends BaseDeclarativeTool<EventLogQueryEventsParams, ToolResult> {
    constructor() {
        super('eventlog_query_events', 'Query Events', 'Query events using DSL', Kind.Other, {
            type: 'object',
            properties: {
                query: { 
                    type: 'object',
                    description: 'Event log query DSL object',
                    properties: {
                        from: {
                            type: 'object',
                            properties: {
                                instance: { type: 'string' },
                                stream: { type: 'string' }
                            },
                            required: ['instance']
                        },
                        where: { type: 'array' },
                        select: { type: 'array', items: { type: 'string' } },
                        orderBy: { type: 'object' },
                        limit: { type: 'number' },
                        offset: { type: 'number' },
                        reduce: { type: 'object' }
                    },
                    required: ['from']
                },
            },
            required: ['query'],
        });
    }

    protected override createInvocation(params: EventLogQueryEventsParams): ToolInvocation<EventLogQueryEventsParams, ToolResult> {
        return new EventLogQueryEventsInvocation(params);
    }
}
