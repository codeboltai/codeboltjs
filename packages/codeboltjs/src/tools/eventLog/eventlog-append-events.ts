import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogAppendMultipleResponse, AppendEventsParams } from '../../types/eventLog';

export interface EventLogAppendEventsParams extends AppendEventsParams {}

class EventLogAppendEventsInvocation extends BaseToolInvocation<EventLogAppendEventsParams, ToolResult> {
    constructor(params: EventLogAppendEventsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogAppendMultipleResponse = await eventLog.appendEvents(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to append events'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to append events'}`,
                    error: { message: response.error || response.message || 'Failed to append events', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const { count } = response.data;
            return {
                llmContent: `Successfully appended ${count} event(s)`,
                returnDisplay: `Appended ${count} event(s) to event log`,
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

export class EventLogAppendEventsTool extends BaseDeclarativeTool<EventLogAppendEventsParams, ToolResult> {
    constructor() {
        super('eventlog_append_events', 'Append Multiple Events', 'Append multiple events to the event log', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'ID of the event log instance' },
                events: { 
                    type: 'array', 
                    items: {
                        type: 'object',
                        properties: {
                            stream_id: { type: 'string' },
                            streamId: { type: 'string' },
                            event_type: { type: 'string' },
                            eventType: { type: 'string' },
                            payload: { type: 'object' },
                            metadata: { type: 'object' }
                        }
                    },
                    description: 'Array of events to append' 
                },
                autoCreateInstance: { type: 'boolean', description: 'Auto-create instance if not exists' },
            },
            required: ['instanceId', 'events'],
        });
    }

    protected override createInvocation(params: EventLogAppendEventsParams): ToolInvocation<EventLogAppendEventsParams, ToolResult> {
        return new EventLogAppendEventsInvocation(params);
    }
}
