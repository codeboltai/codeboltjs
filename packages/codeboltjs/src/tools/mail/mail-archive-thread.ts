/**
 * Mail Archive Thread Tool - Archives a thread
 * Wraps the SDK's cbmail.archiveThread() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailArchiveThread tool
 */
export interface MailArchiveThreadToolParams {
    /**
     * The unique identifier of the thread to archive
     */
    threadId: string;
}

class MailArchiveThreadToolInvocation extends BaseToolInvocation<
    MailArchiveThreadToolParams,
    ToolResult
> {
    constructor(params: MailArchiveThreadToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.archiveThread(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully archived thread',
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
 * Implementation of the MailArchiveThread tool
 */
export class MailArchiveThreadTool extends BaseDeclarativeTool<
    MailArchiveThreadToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_archive_thread';

    constructor() {
        super(
            MailArchiveThreadTool.Name,
            'MailArchiveThread',
            'Archives a thread by its ID.',
            Kind.Edit,
            {
                properties: {
                    threadId: {
                        description: 'The unique identifier of the thread to archive',
                        type: 'string',
                    },
                },
                required: ['threadId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailArchiveThreadToolParams,
    ): ToolInvocation<MailArchiveThreadToolParams, ToolResult> {
        return new MailArchiveThreadToolInvocation(params);
    }
}
