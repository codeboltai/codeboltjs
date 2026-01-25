/**
 * EventQueue Add Event Tool
 * Wraps the SDK's agentEventQueue.addEvent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import agentEventQueue from '../../modules/agentEventQueue';
import { AgentEventType, AgentEventPriority } from '../../types/agentEventQueue';

/**
 * Parameters for the EventQueue Add Event tool
 */
export interface EventQueueAddEventParams {
    /** Target agent ID */
    targetAgentId: string;
    /** Target agent instance ID (optional) */
    targetAgentInstanceId?: string;
    /** Target thread ID (optional) */
    targetThreadId?: string;
    /** Event type */
    eventType?: 'agentMessage' | 'calendarUpdate' | 'systemNotification' | 'taskUpdate' | 'custom';
    /** Event priority */
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    /** Event payload - structure depends on eventType */
    payload: Record<string, any>;
    /** Expiration time (ISO string) */
    expiresAt?: string;
    /** Additional metadata */
    metadata?: Record<string, any>;
}

class EventQueueAddEventInvocation extends BaseToolInvocation<
    EventQueueAddEventParams,
    ToolResult
> {
    constructor(params: EventQueueAddEventParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await agentEventQueue.addEvent({
                targetAgentId: this.params.targetAgentId,
                targetAgentInstanceId: this.params.targetAgentInstanceId,
                targetThreadId: this.params.targetThreadId,
                eventType: this.params.eventType as AgentEventType || AgentEventType.CUSTOM,
                priority: this.params.priority as AgentEventPriority || AgentEventPriority.NORMAL,
                payload: this.params.payload as any,
                expiresAt: this.params.expiresAt,
                metadata: this.params.metadata
            });

            if (!response.success) {
                return {
                    llmContent: `Failed to add event: ${response.message}`,
                    returnDisplay: `Error: ${response.message}`,
                    error: {
                        message: response.message,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let llmContent = `Event added successfully.\n\n`;
            llmContent += `Event ID: ${response.data?.event?.eventId}\n`;
            llmContent += `Target Agent: ${this.params.targetAgentId}\n`;
            llmContent += `Status: ${response.data?.event?.status}`;

            return {
                llmContent,
                returnDisplay: `Added event ${response.data?.event?.eventId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding event: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for adding an event to a target agent's queue
 */
export class EventQueueAddEventTool extends BaseDeclarativeTool<
    EventQueueAddEventParams,
    ToolResult
> {
    static readonly Name: string = 'eventqueue_add_event';

    constructor() {
        super(
            EventQueueAddEventTool.Name,
            'Add Event to Queue',
            'Add an event to a target agent\'s event queue. The event will be delivered via WebSocket if the agent is connected, or queued for later delivery.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    targetAgentId: {
                        type: 'string',
                        description: 'The ID of the target agent to receive the event'
                    },
                    targetAgentInstanceId: {
                        type: 'string',
                        description: 'Optional specific instance ID of the target agent'
                    },
                    targetThreadId: {
                        type: 'string',
                        description: 'Optional thread ID for the target agent'
                    },
                    eventType: {
                        type: 'string',
                        enum: ['agentMessage', 'calendarUpdate', 'systemNotification', 'taskUpdate', 'custom'],
                        description: 'Type of event (default: custom)'
                    },
                    priority: {
                        type: 'string',
                        enum: ['low', 'normal', 'high', 'urgent'],
                        description: 'Event priority (default: normal)'
                    },
                    payload: {
                        type: 'object',
                        description: 'Event payload data. Must include a "type" field matching eventType.'
                    },
                    expiresAt: {
                        type: 'string',
                        description: 'Optional expiration time in ISO 8601 format'
                    },
                    metadata: {
                        type: 'object',
                        description: 'Optional additional metadata'
                    }
                },
                required: ['targetAgentId', 'payload']
            }
        );
    }

    protected createInvocation(
        params: EventQueueAddEventParams,
    ): ToolInvocation<EventQueueAddEventParams, ToolResult> {
        return new EventQueueAddEventInvocation(params);
    }
}
