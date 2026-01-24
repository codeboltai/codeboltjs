/**
 * Mail Send Message Tool - Sends a message in a thread
 * Wraps the SDK's cbmail.sendMessage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailSendMessage tool
 */
export interface MailSendMessageToolParams {
    /**
     * The thread ID to send the message to
     */
    threadId: string;

    /**
     * The sender agent ID
     */
    from: string;

    /**
     * The recipient agent IDs
     */
    to: string[];

    /**
     * The message content
     */
    content: string;

    /**
     * The message type
     */
    messageType?: string;

    /**
     * Additional metadata for the message
     */
    metadata?: Record<string, unknown>;
}

class MailSendMessageToolInvocation extends BaseToolInvocation<
    MailSendMessageToolParams,
    ToolResult
> {
    constructor(params: MailSendMessageToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.sendMessage(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully sent message',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error: ${errorMessage}`,
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
 * Implementation of the MailSendMessage tool
 */
export class MailSendMessageTool extends BaseDeclarativeTool<
    MailSendMessageToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_send_message';

    constructor() {
        super(
            MailSendMessageTool.Name,
            'MailSendMessage',
            'Sends a message in a thread from one agent to one or more recipients.',
            Kind.Edit,
            {
                properties: {
                    threadId: {
                        description: 'The thread ID to send the message to',
                        type: 'string',
                    },
                    from: {
                        description: 'The sender agent ID',
                        type: 'string',
                    },
                    to: {
                        description: 'The recipient agent IDs',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    content: {
                        description: 'The message content',
                        type: 'string',
                    },
                    messageType: {
                        description: 'The message type',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Additional metadata for the message',
                        type: 'object',
                    },
                },
                required: ['threadId', 'from', 'to', 'content'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailSendMessageToolParams,
    ): ToolInvocation<MailSendMessageToolParams, ToolResult> {
        return new MailSendMessageToolInvocation(params);
    }
}
