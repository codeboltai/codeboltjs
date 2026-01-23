/**
 * Mail List Threads Tool - Lists mail threads with optional filters
 * Wraps the SDK's cbmail.listThreads() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailListThreads tool
 */
export interface MailListThreadsToolParams {
    /**
     * Filter by thread type
     */
    type?: 'agent-to-agent' | 'agent-to-user' | 'broadcast';

    /**
     * Filter by thread status
     */
    status?: 'open' | 'closed' | 'archived';

    /**
     * Filter by participant
     */
    participant?: string;

    /**
     * Search query
     */
    search?: string;

    /**
     * Maximum number of threads to return
     */
    limit?: number;

    /**
     * Offset for pagination
     */
    offset?: number;
}

class MailListThreadsToolInvocation extends BaseToolInvocation<
    MailListThreadsToolParams,
    ToolResult
> {
    constructor(params: MailListThreadsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.listThreads(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully listed ${response.threads?.length || 0} threads`,
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
 * Implementation of the MailListThreads tool
 */
export class MailListThreadsTool extends BaseDeclarativeTool<
    MailListThreadsToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_list_threads';

    constructor() {
        super(
            MailListThreadsTool.Name,
            'MailListThreads',
            'Lists mail threads with optional filters for type, status, participant, and search.',
            Kind.Read,
            {
                properties: {
                    type: {
                        description: 'Filter by thread type',
                        type: 'string',
                        enum: ['agent-to-agent', 'agent-to-user', 'broadcast'],
                    },
                    status: {
                        description: 'Filter by thread status',
                        type: 'string',
                        enum: ['open', 'closed', 'archived'],
                    },
                    participant: {
                        description: 'Filter by participant',
                        type: 'string',
                    },
                    search: {
                        description: 'Search query',
                        type: 'string',
                    },
                    limit: {
                        description: 'Maximum number of threads to return',
                        type: 'number',
                    },
                    offset: {
                        description: 'Offset for pagination',
                        type: 'number',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailListThreadsToolParams,
    ): ToolInvocation<MailListThreadsToolParams, ToolResult> {
        return new MailListThreadsToolInvocation(params);
    }
}
