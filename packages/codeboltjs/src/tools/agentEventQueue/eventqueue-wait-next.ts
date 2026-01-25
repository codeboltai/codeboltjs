/**
 * EventQueue Wait Next Tool
 * Wraps the SDK's agentEventQueue.waitForNextQueueEvent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import agentEventQueue from '../../modules/agentEventQueue';
import type { AgentEventMessage } from '../../types/agentEventQueue';

/**
 * Parameters for the EventQueue Wait Next tool
 */
export interface EventQueueWaitNextParams {
    /** Maximum number of events to return */
    maxDepth?: number;
}

class EventQueueWaitNextInvocation extends BaseToolInvocation<
    EventQueueWaitNextParams,
    ToolResult
> {
    constructor(params: EventQueueWaitNextParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const result = await agentEventQueue.waitForNextQueueEvent(this.params.maxDepth || 1);

            // Normalize to array for consistent handling
            const events: AgentEventMessage[] = Array.isArray(result) ? result : [result];

            let llmContent = `Received ${events.length} event(s):\n\n`;

            for (const event of events) {
                llmContent += `---\n`;
                llmContent += `Event ID: ${event.eventId}\n`;
                llmContent += `Type: ${event.eventType}\n`;
                llmContent += `Priority: ${event.priority}\n`;
                llmContent += `From: ${event.sourceAgentId || 'Unknown'}\n`;
                llmContent += `Created: ${event.createdAt}\n`;
                llmContent += `Payload: ${JSON.stringify(event.payload, null, 2)}\n`;
            }

            llmContent += `\nNote: These events have been acknowledged and removed from the queue.`;

            return {
                llmContent,
                returnDisplay: `Received ${events.length} event(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error waiting for events: ${errorMessage}`,
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
 * Tool for waiting for the next queue event
 */
export class EventQueueWaitNextTool extends BaseDeclarativeTool<
    EventQueueWaitNextParams,
    ToolResult
> {
    static readonly Name: string = 'eventqueue_wait_next';

    constructor() {
        super(
            EventQueueWaitNextTool.Name,
            'Wait for Next Event',
            'Wait for the next event(s) to arrive in the queue. This is a blocking call that resolves when an event is received. Events are automatically acknowledged.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    maxDepth: {
                        type: 'number',
                        description: 'Maximum number of events to return (default: 1). If more than 1, will try to batch events from the cache after receiving the first.'
                    }
                },
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventQueueWaitNextParams,
    ): ToolInvocation<EventQueueWaitNextParams, ToolResult> {
        return new EventQueueWaitNextInvocation(params);
    }
}
