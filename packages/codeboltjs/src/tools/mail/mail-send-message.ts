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
    threadId?: string;

    /**
     * The sender agent ID
     */
    senderId: string;

    /**
     * The sender name
     */
    senderName: string;

    /**
     * The recipient agent IDs
     */
    recipients: string[];

    /**
     * The message content
     */
    body: string;

    /**
     * The message subject (used when creating new thread)
     */
    subject?: string;

    /**
     * The message importance
     */
    importance?: 'low' | 'normal' | 'high';

    /**
     * Whether acknowledgement is required
     */
    ackRequired?: boolean;

    /**
     * File references for attachments
     */
    fileReferences?: string[];
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
                        description: 'The thread ID to send the message to (optional for new thread)',
                        type: 'string',
                    },
                    senderId: {
                        description: 'The sender agent ID',
                        type: 'string',
                    },
                    senderName: {
                        description: 'The sender name',
                        type: 'string',
                    },
                    recipients: {
                        description: 'The recipient agent IDs',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    body: {
                        description: 'The message content',
                        type: 'string',
                    },
                    subject: {
                        description: 'The message subject (used when creating new thread)',
                        type: 'string',
                    },
                    importance: {
                        description: 'The message importance',
                        type: 'string',
                        enum: ['low', 'normal', 'high'],
                    },
                    ackRequired: {
                        description: 'Whether acknowledgement is required',
                        type: 'boolean',
                    },
                    fileReferences: {
                        description: 'File references for attachments',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['senderId', 'senderName', 'recipients', 'body'],
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
