import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogAppendResponse, AppendEventParams } from '../../types/eventLog';

export interface EventLogAppendEventParams extends AppendEventParams {}

class EventLogAppendEventInvocation extends BaseToolInvocation<EventLogAppendEventParams, ToolResult> {
    constructor(params: EventLogAppendEventParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogAppendResponse = await eventLog.appendEvent(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to append event'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to append event'}`,
                    error: { message: response.error || response.message || 'Failed to append event', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const event = response.data.event;
            return {
                llmContent: `Event appended successfully with ID: ${event.id}`,
                returnDisplay: `Appended event: ${event.event_type} (ID: ${event.id})`,
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

export class EventLogAppendEventTool extends BaseDeclarativeTool<EventLogAppendEventParams, ToolResult> {
    constructor() {
        super('eventlog_append_event', 'Append Event', 'Append a single event to the event log', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'ID of the event log instance' },
                stream_id: { type: 'string', description: 'Stream ID for the event' },
                streamId: { type: 'string', description: 'Stream ID for the event (alternative)' },
                event_type: { type: 'string', description: 'Type of the event' },
                eventType: { type: 'string', description: 'Type of the event (alternative)' },
                payload: { type: 'object', description: 'Event payload' },
                metadata: { type: 'object', description: 'Event metadata' },
                autoCreateInstance: { type: 'boolean', description: 'Auto-create instance if not exists' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: EventLogAppendEventParams): ToolInvocation<EventLogAppendEventParams, ToolResult> {
        return new EventLogAppendEventInvocation(params);
    }
}
