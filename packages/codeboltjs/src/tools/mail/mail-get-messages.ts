/**
 * Mail Get Messages Tool - Gets all messages in a thread
 * Wraps the SDK's cbmail.getMessages() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailGetMessages tool
 */
export interface MailGetMessagesToolParams {
    /**
     * The thread ID to get messages from
     */
    threadId: string;
}

class MailGetMessagesToolInvocation extends BaseToolInvocation<
    MailGetMessagesToolParams,
    ToolResult
> {
    constructor(params: MailGetMessagesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.getMessages(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved ${response.messages?.length || 0} messages`,
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
 * Implementation of the MailGetMessages tool
 */
export class MailGetMessagesTool extends BaseDeclarativeTool<
    MailGetMessagesToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_get_messages';

    constructor() {
        super(
            MailGetMessagesTool.Name,
            'MailGetMessages',
            'Gets all messages in a specific thread.',
            Kind.Read,
            {
                properties: {
                    threadId: {
                        description: 'The thread ID to get messages from',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailGetMessagesToolParams,
    ): ToolInvocation<MailGetMessagesToolParams, ToolResult> {
        return new MailGetMessagesToolInvocation(params);
    }
}
