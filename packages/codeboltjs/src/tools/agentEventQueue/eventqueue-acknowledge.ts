/**
 * EventQueue Acknowledge Event Tool
 * Wraps the SDK's agentEventQueue.acknowledgeEvent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import agentEventQueue from '../../modules/agentEventQueue';

/**
 * Parameters for the EventQueue Acknowledge Event tool
 */
export interface EventQueueAcknowledgeParams {
    /** ID of the event to acknowledge */
    eventId: string;
    /** Whether processing was successful */
    success?: boolean;
    /** Error message if processing failed */
    errorMessage?: string;
}

class EventQueueAcknowledgeInvocation extends BaseToolInvocation<
    EventQueueAcknowledgeParams,
    ToolResult
> {
    constructor(params: EventQueueAcknowledgeParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await agentEventQueue.acknowledgeEvent(
                this.params.eventId,
                this.params.success !== false,
                this.params.errorMessage
            );

            if (!response.success) {
                return {
                    llmContent: `Failed to acknowledge event: ${response.message}`,
                    returnDisplay: `Error: ${response.message}`,
                    error: {
                        message: response.message,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const status = this.params.success !== false ? 'successfully' : 'with failure';
            let llmContent = `Event ${this.params.eventId} acknowledged ${status}.`;

            if (this.params.errorMessage) {
                llmContent += `\nError message: ${this.params.errorMessage}`;
            }

            return {
                llmContent,
                returnDisplay: `Acknowledged ${this.params.eventId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error acknowledging event: ${errorMessage}`,
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
 * Tool for manually acknowledging an event
 */
export class EventQueueAcknowledgeTool extends BaseDeclarativeTool<
    EventQueueAcknowledgeParams,
    ToolResult
> {
    static readonly Name: string = 'eventqueue_acknowledge';

    constructor() {
        super(
            EventQueueAcknowledgeTool.Name,
            'Acknowledge Event',
            'Manually acknowledge an event from the queue. Use this when handling events via the onQueueEvent handler. Most operations automatically acknowledge events.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    eventId: {
                        type: 'string',
                        description: 'The ID of the event to acknowledge'
                    },
                    success: {
                        type: 'boolean',
                        description: 'Whether the event was processed successfully (default: true)'
                    },
                    errorMessage: {
                        type: 'string',
                        description: 'Error message if processing failed'
                    }
                },
                required: ['eventId']
            }
        );
    }

    protected createInvocation(
        params: EventQueueAcknowledgeParams,
    ): ToolInvocation<EventQueueAcknowledgeParams, ToolResult> {
        return new EventQueueAcknowledgeInvocation(params);
    }
}
