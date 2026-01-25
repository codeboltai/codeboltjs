/**
 * EventQueue Get Pending Tool
 * Wraps the SDK's agentEventQueue.getPendingQueueEvents() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import agentEventQueue from '../../modules/agentEventQueue';

/**
 * Parameters for the EventQueue Get Pending tool
 */
export interface EventQueueGetPendingParams {
    /** Maximum number of events to return */
    maxDepth?: number;
}

class EventQueueGetPendingInvocation extends BaseToolInvocation<
    EventQueueGetPendingParams,
    ToolResult
> {
    constructor(params: EventQueueGetPendingParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const events = await agentEventQueue.getPendingQueueEvents(this.params.maxDepth);

            if (events.length === 0) {
                return {
                    llmContent: 'No pending events in the queue.',
                    returnDisplay: 'No pending events',
                };
            }

            let llmContent = `Retrieved ${events.length} pending event(s):\n\n`;

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
                returnDisplay: `Retrieved ${events.length} event(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting pending events: ${errorMessage}`,
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
 * Tool for getting pending events from the queue
 */
export class EventQueueGetPendingTool extends BaseDeclarativeTool<
    EventQueueGetPendingParams,
    ToolResult
> {
    static readonly Name: string = 'eventqueue_get_pending';

    constructor() {
        super(
            EventQueueGetPendingTool.Name,
            'Get Pending Events',
            'Get pending events from the local event cache. Events are automatically acknowledged and removed from the queue after retrieval. If no local events exist, fetches from the backend.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    maxDepth: {
                        type: 'number',
                        description: 'Maximum number of events to return. If not specified, returns all pending events.'
                    }
                },
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventQueueGetPendingParams,
    ): ToolInvocation<EventQueueGetPendingParams, ToolResult> {
        return new EventQueueGetPendingInvocation(params);
    }
}
