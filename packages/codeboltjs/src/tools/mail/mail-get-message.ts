/**
 * Mail Get Message Tool - Gets a specific message by ID
 * Wraps the SDK's cbmail.getMessage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailGetMessage tool
 */
export interface MailGetMessageToolParams {
    /**
     * The unique identifier of the message to retrieve
     */
    messageId: string;
}

class MailGetMessageToolInvocation extends BaseToolInvocation<
    MailGetMessageToolParams,
    ToolResult
> {
    constructor(params: MailGetMessageToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.getMessage(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved message',
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
 * Implementation of the MailGetMessage tool
 */
export class MailGetMessageTool extends BaseDeclarativeTool<
    MailGetMessageToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_get_message';

    constructor() {
        super(
            MailGetMessageTool.Name,
            'MailGetMessage',
            'Gets a specific message by its ID.',
            Kind.Read,
            {
                properties: {
                    messageId: {
                        description: 'The unique identifier of the message to retrieve',
                        type: 'string',
                    },
                },
                required: ['messageId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailGetMessageToolParams,
    ): ToolInvocation<MailGetMessageToolParams, ToolResult> {
        return new MailGetMessageToolInvocation(params);
    }
}
