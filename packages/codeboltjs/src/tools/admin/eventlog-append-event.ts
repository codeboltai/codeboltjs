/**
 * EventLog Append Event Tool - Appends an event to an event log
 * Wraps the SDK's eventLog.appendEvent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';

/**
 * Parameters for the EventLogAppendEvent tool
 */
export interface EventLogAppendEventToolParams {
    /**
     * The ID of the event log instance to append to
     */
    instance_id: string;

    /**
     * Optional stream ID to categorize the event
     */
    stream_id?: string;

    /**
     * The type of event being logged
     */
    event_type?: string;

    /**
     * The event payload data
     */
    payload?: Record<string, any>;

    /**
     * Optional metadata for the event
     */
    metadata?: Record<string, any>;

    /**
     * Whether to auto-create the instance if it doesn't exist
     */
    auto_create_instance?: boolean;
}

class EventLogAppendEventToolInvocation extends BaseToolInvocation<
    EventLogAppendEventToolParams,
    ToolResult
> {
    constructor(params: EventLogAppendEventToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await eventLog.appendEvent({
                instanceId: this.params.instance_id,
                stream_id: this.params.stream_id,
                event_type: this.params.event_type,
                payload: this.params.payload,
                metadata: this.params.metadata,
                autoCreateInstance: this.params.auto_create_instance,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error appending event: ${errorMsg}`,
                    returnDisplay: `Error appending event: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const event = response.data?.event;
            const resultContent = event
                ? `Successfully appended event:\nEvent ID: ${event.id}\nInstance ID: ${event.instanceId}\nStream ID: ${event.stream_id}\nEvent Type: ${event.event_type}\nSequence: ${event.sequence_number}\nTimestamp: ${event.timestamp}`
                : 'Event appended successfully';

            return {
                llmContent: resultContent,
                returnDisplay: `Appended event to instance: ${this.params.instance_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error appending event: ${errorMessage}`,
                returnDisplay: `Error appending event: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EventLogAppendEvent tool logic
 */
export class EventLogAppendEventTool extends BaseDeclarativeTool<
    EventLogAppendEventToolParams,
    ToolResult
> {
    static readonly Name: string = 'eventlog_append_event';

    constructor() {
        super(
            EventLogAppendEventTool.Name,
            'EventLogAppendEvent',
            'Appends a new event to an event log instance. Events can include a type, payload data, metadata, and can be organized into streams.',
            Kind.Edit,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the event log instance to append to',
                        type: 'string',
                    },
                    stream_id: {
                        description: 'Optional stream ID to categorize the event within the instance',
                        type: 'string',
                    },
                    event_type: {
                        description: 'The type of event being logged (e.g., "user_action", "system_event")',
                        type: 'string',
                    },
                    payload: {
                        description: 'The event payload data as a JSON object',
                        type: 'object',
                    },
                    metadata: {
                        description: 'Optional metadata for the event as a JSON object',
                        type: 'object',
                    },
                    auto_create_instance: {
                        description: 'Whether to automatically create the instance if it does not exist',
                        type: 'boolean',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EventLogAppendEventToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: EventLogAppendEventToolParams,
    ): ToolInvocation<EventLogAppendEventToolParams, ToolResult> {
        return new EventLogAppendEventToolInvocation(params);
    }
}
