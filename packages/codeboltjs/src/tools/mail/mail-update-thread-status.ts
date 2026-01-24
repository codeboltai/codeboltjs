/**
 * Mail Update Thread Status Tool - Updates the status of a thread
 * Wraps the SDK's cbmail.updateThreadStatus() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailUpdateThreadStatus tool
 */
export interface MailUpdateThreadStatusToolParams {
    /**
     * The unique identifier of the thread to update
     */
    threadId: string;

    /**
     * The new status for the thread
     */
    status: 'open' | 'closed' | 'archived';
}

class MailUpdateThreadStatusToolInvocation extends BaseToolInvocation<
    MailUpdateThreadStatusToolParams,
    ToolResult
> {
    constructor(params: MailUpdateThreadStatusToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.updateThreadStatus(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated thread status to ${this.params.status}`,
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
 * Implementation of the MailUpdateThreadStatus tool
 */
export class MailUpdateThreadStatusTool extends BaseDeclarativeTool<
    MailUpdateThreadStatusToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_update_thread_status';

    constructor() {
        super(
            MailUpdateThreadStatusTool.Name,
            'MailUpdateThreadStatus',
            'Updates the status of a thread (open, closed, or archived).',
            Kind.Edit,
            {
                properties: {
                    threadId: {
                        description: 'The unique identifier of the thread to update',
                        type: 'string',
                    },
                    status: {
                        description: 'The new status for the thread',
                        type: 'string',
                        enum: ['open', 'closed', 'archived'],
                    },
                },
                required: ['threadId', 'status'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailUpdateThreadStatusToolParams,
    ): ToolInvocation<MailUpdateThreadStatusToolParams, ToolResult> {
        return new MailUpdateThreadStatusToolInvocation(params);
    }
}
