/**
 * Mail Summarize Thread Tool - Summarizes a thread
 * Wraps the SDK's cbmail.summarizeThread() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailSummarizeThread tool
 */
export interface MailSummarizeThreadToolParams {
    /**
     * The thread ID to summarize
     */
    threadId: string;

    /**
     * The agent ID requesting the summary
     */
    agentId: string;
}

class MailSummarizeThreadToolInvocation extends BaseToolInvocation<
    MailSummarizeThreadToolParams,
    ToolResult
> {
    constructor(params: MailSummarizeThreadToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.summarizeThread(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully summarized thread',
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
 * Implementation of the MailSummarizeThread tool
 */
export class MailSummarizeThreadTool extends BaseDeclarativeTool<
    MailSummarizeThreadToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_summarize_thread';

    constructor() {
        super(
            MailSummarizeThreadTool.Name,
            'MailSummarizeThread',
            'Generates a summary of a thread.',
            Kind.Read,
            {
                properties: {
                    threadId: {
                        description: 'The thread ID to summarize',
                        type: 'string',
                    },
                    agentId: {
                        description: 'The agent ID requesting the summary',
                        type: 'string',
                    },
                },
                required: ['threadId', 'agentId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailSummarizeThreadToolParams,
    ): ToolInvocation<MailSummarizeThreadToolParams, ToolResult> {
        return new MailSummarizeThreadToolInvocation(params);
    }
}
