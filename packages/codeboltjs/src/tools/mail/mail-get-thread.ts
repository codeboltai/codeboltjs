/**
 * Mail Get Thread Tool - Gets details of a specific thread
 * Wraps the SDK's cbmail.getThread() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailGetThread tool
 */
export interface MailGetThreadToolParams {
    /**
     * The unique identifier of the thread to retrieve
     */
    threadId: string;
}

class MailGetThreadToolInvocation extends BaseToolInvocation<
    MailGetThreadToolParams,
    ToolResult
> {
    constructor(params: MailGetThreadToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.getThread(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved thread',
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
 * Implementation of the MailGetThread tool
 */
export class MailGetThreadTool extends BaseDeclarativeTool<
    MailGetThreadToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_get_thread';

    constructor() {
        super(
            MailGetThreadTool.Name,
            'MailGetThread',
            'Gets details of a specific thread by its ID.',
            Kind.Read,
            {
                properties: {
                    threadId: {
                        description: 'The unique identifier of the thread to retrieve',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailGetThreadToolParams,
    ): ToolInvocation<MailGetThreadToolParams, ToolResult> {
        return new MailGetThreadToolInvocation(params);
    }
}
