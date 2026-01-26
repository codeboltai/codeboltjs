/**
 * Mail Search Tool - Searches messages
 * Wraps the SDK's cbmail.search() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailSearch tool
 */
export interface MailSearchToolParams {
    /**
     * The search query
     */
    query: string;

    /**
     * The agent ID performing the search (optional)
     */
    agentId?: string;

    /**
     * Filter by thread ID
     */
    threadId?: string;

    /**
     * Filter by sender
     */
    from?: string;

    /**
     * Maximum number of results
     */
    limit?: number;
}

class MailSearchToolInvocation extends BaseToolInvocation<
    MailSearchToolParams,
    ToolResult
> {
    constructor(params: MailSearchToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.search(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully searched messages',
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
 * Implementation of the MailSearch tool
 */
export class MailSearchTool extends BaseDeclarativeTool<
    MailSearchToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_search';

    constructor() {
        super(
            MailSearchTool.Name,
            'MailSearch',
            'Searches messages with optional filters for thread, sender, and pagination.',
            Kind.Read,
            {
                properties: {
                    query: {
                        description: 'The search query',
                        type: 'string',
                    },
                    agentId: {
                        description: 'The agent ID performing the search (optional)',
                        type: 'string',
                    },
                    threadId: {
                        description: 'Filter by thread ID',
                        type: 'string',
                    },
                    from: {
                        description: 'Filter by sender',
                        type: 'string',
                    },
                    limit: {
                        description: 'Maximum number of results',
                        type: 'number',
                    },
                },
                required: ['query'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailSearchToolParams,
    ): ToolInvocation<MailSearchToolParams, ToolResult> {
        return new MailSearchToolInvocation(params);
    }
}
