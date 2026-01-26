/**
 * Mail Reply Message Tool - Replies to a message
 * Wraps the SDK's cbmail.replyMessage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailReplyMessage tool
 */
export interface MailReplyMessageToolParams {
    /**
     * The message ID to reply to
     */
    messageId: string;

    /**
     * The sender agent ID
     */
    senderId: string;

    /**
     * The sender name
     */
    senderName: string;

    /**
     * The reply content
     */
    body: string;

    /**
     * File references for attachments
     */
    fileReferences?: string[];
}

class MailReplyMessageToolInvocation extends BaseToolInvocation<
    MailReplyMessageToolParams,
    ToolResult
> {
    constructor(params: MailReplyMessageToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.replyMessage(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully replied to message',
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
 * Implementation of the MailReplyMessage tool
 */
export class MailReplyMessageTool extends BaseDeclarativeTool<
    MailReplyMessageToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_reply_message';

    constructor() {
        super(
            MailReplyMessageTool.Name,
            'MailReplyMessage',
            'Replies to a specific message in a thread.',
            Kind.Edit,
            {
                properties: {
                    messageId: {
                        description: 'The message ID to reply to',
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
                    body: {
                        description: 'The reply content',
                        type: 'string',
                    },
                    fileReferences: {
                        description: 'File references for attachments',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['messageId', 'senderId', 'senderName', 'body'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailReplyMessageToolParams,
    ): ToolInvocation<MailReplyMessageToolParams, ToolResult> {
        return new MailReplyMessageToolInvocation(params);
    }
}
