/**
 * EventQueue Send Message Tool
 * Wraps the SDK's agentEventQueue.sendAgentMessage() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import agentEventQueue from '../../modules/agentEventQueue';
import { AgentEventPriority } from '../../types/agentEventQueue';

/**
 * Parameters for the EventQueue Send Message tool
 */
export interface EventQueueSendMessageParams {
    /** Target agent ID */
    targetAgentId: string;
    /** Target thread ID (optional) */
    targetThreadId?: string;
    /** Message content */
    content: string;
    /** Message type */
    messageType?: 'text' | 'json' | 'command';
    /** Message priority */
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    /** Reference to a previous event ID for replies */
    replyTo?: string;
}

class EventQueueSendMessageInvocation extends BaseToolInvocation<
    EventQueueSendMessageParams,
    ToolResult
> {
    constructor(params: EventQueueSendMessageParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await agentEventQueue.sendAgentMessage({
                targetAgentId: this.params.targetAgentId,
                targetThreadId: this.params.targetThreadId,
                content: this.params.content,
                messageType: this.params.messageType || 'text',
                priority: this.params.priority as AgentEventPriority || AgentEventPriority.NORMAL,
                replyTo: this.params.replyTo
            });

            if (!response.success) {
                return {
                    llmContent: `Failed to send message: ${response.message}`,
                    returnDisplay: `Error: ${response.message}`,
                    error: {
                        message: response.message,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let llmContent = `Message sent successfully.\n\n`;
            llmContent += `Event ID: ${response.data?.event?.eventId}\n`;
            llmContent += `Target Agent: ${this.params.targetAgentId}\n`;
            llmContent += `Content: ${this.params.content.substring(0, 100)}${this.params.content.length > 100 ? '...' : ''}`;

            return {
                llmContent,
                returnDisplay: `Sent message to ${this.params.targetAgentId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error sending message: ${errorMessage}`,
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
 * Tool for sending an inter-agent message
 */
export class EventQueueSendMessageTool extends BaseDeclarativeTool<
    EventQueueSendMessageParams,
    ToolResult
> {
    static readonly Name: string = 'eventqueue_send_message';

    constructor() {
        super(
            EventQueueSendMessageTool.Name,
            'Send Agent Message',
            'Send a message to another agent via the event queue. This is a convenience wrapper for inter-agent communication.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    targetAgentId: {
                        type: 'string',
                        description: 'The ID of the target agent to receive the message'
                    },
                    targetThreadId: {
                        type: 'string',
                        description: 'Optional thread ID for the target agent'
                    },
                    content: {
                        type: 'string',
                        description: 'The message content to send'
                    },
                    messageType: {
                        type: 'string',
                        enum: ['text', 'json', 'command'],
                        description: 'Type of message content (default: text)'
                    },
                    priority: {
                        type: 'string',
                        enum: ['low', 'normal', 'high', 'urgent'],
                        description: 'Message priority (default: normal)'
                    },
                    replyTo: {
                        type: 'string',
                        description: 'Optional event ID this message is replying to'
                    }
                },
                required: ['targetAgentId', 'content']
            }
        );
    }

    protected createInvocation(
        params: EventQueueSendMessageParams,
    ): ToolInvocation<EventQueueSendMessageParams, ToolResult> {
        return new EventQueueSendMessageInvocation(params);
    }
}
