/**
 * Mail Mark Read Tool - Marks messages as read
 * Wraps the SDK's cbmail.markRead() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailMarkRead tool
 */
export interface MailMarkReadToolParams {
    /**
     * The message IDs to mark as read
     */
    messageIds: string[];

    /**
     * The agent ID marking the messages as read
     */
    agentId: string;
}

class MailMarkReadToolInvocation extends BaseToolInvocation<
    MailMarkReadToolParams,
    ToolResult
> {
    constructor(params: MailMarkReadToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.markRead(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully marked ${this.params.messageIds.length} message(s) as read`,
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
 * Implementation of the MailMarkRead tool
 */
export class MailMarkReadTool extends BaseDeclarativeTool<
    MailMarkReadToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_mark_read';

    constructor() {
        super(
            MailMarkReadTool.Name,
            'MailMarkRead',
            'Marks one or more messages as read for a specific agent.',
            Kind.Edit,
            {
                properties: {
                    messageIds: {
                        description: 'The message IDs to mark as read',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    agentId: {
                        description: 'The agent ID marking the messages as read',
                        type: 'string',
                    },
                },
                required: ['messageIds', 'agentId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailMarkReadToolParams,
    ): ToolInvocation<MailMarkReadToolParams, ToolResult> {
        return new MailMarkReadToolInvocation(params);
    }
}
