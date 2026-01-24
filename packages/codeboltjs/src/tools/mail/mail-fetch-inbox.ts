/**
 * Mail Fetch Inbox Tool - Fetches messages from the inbox
 * Wraps the SDK's cbmail.fetchInbox() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailFetchInbox tool
 */
export interface MailFetchInboxToolParams {
    /**
     * The agent ID to fetch inbox for
     */
    agentId: string;

    /**
     * Maximum number of messages to fetch
     */
    limit?: number;

    /**
     * Offset for pagination
     */
    offset?: number;

    /**
     * Filter by read status
     */
    unreadOnly?: boolean;
}

class MailFetchInboxToolInvocation extends BaseToolInvocation<
    MailFetchInboxToolParams,
    ToolResult
> {
    constructor(params: MailFetchInboxToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.fetchInbox(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully fetched inbox',
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
 * Implementation of the MailFetchInbox tool
 */
export class MailFetchInboxTool extends BaseDeclarativeTool<
    MailFetchInboxToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_fetch_inbox';

    constructor() {
        super(
            MailFetchInboxTool.Name,
            'MailFetchInbox',
            'Fetches messages from the inbox for a specific agent with optional pagination and filters.',
            Kind.Read,
            {
                properties: {
                    agentId: {
                        description: 'The agent ID to fetch inbox for',
                        type: 'string',
                    },
                    limit: {
                        description: 'Maximum number of messages to fetch',
                        type: 'number',
                    },
                    offset: {
                        description: 'Offset for pagination',
                        type: 'number',
                    },
                    unreadOnly: {
                        description: 'Filter by read status',
                        type: 'boolean',
                    },
                },
                required: ['agentId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailFetchInboxToolParams,
    ): ToolInvocation<MailFetchInboxToolParams, ToolResult> {
        return new MailFetchInboxToolInvocation(params);
    }
}
