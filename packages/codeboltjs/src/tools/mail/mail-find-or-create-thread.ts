/**
 * Mail Find Or Create Thread Tool - Finds an existing thread or creates a new one
 * Wraps the SDK's cbmail.findOrCreateThread() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailFindOrCreateThread tool
 */
export interface MailFindOrCreateThreadToolParams {
    /**
     * The subject of the thread
     */
    subject: string;

    /**
     * The participants in the thread
     */
    participants: string[];

    /**
     * The type of thread
     */
    type?: 'agent-to-agent' | 'agent-to-user' | 'broadcast';

    /**
     * Additional metadata for the thread
     */
    metadata?: Record<string, unknown>;
}

class MailFindOrCreateThreadToolInvocation extends BaseToolInvocation<
    MailFindOrCreateThreadToolParams,
    ToolResult
> {
    constructor(params: MailFindOrCreateThreadToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.findOrCreateThread(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: response.created ? 'Successfully created new thread' : 'Found existing thread',
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
 * Implementation of the MailFindOrCreateThread tool
 */
export class MailFindOrCreateThreadTool extends BaseDeclarativeTool<
    MailFindOrCreateThreadToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_find_or_create_thread';

    constructor() {
        super(
            MailFindOrCreateThreadTool.Name,
            'MailFindOrCreateThread',
            'Finds an existing thread matching the criteria or creates a new one if not found.',
            Kind.Edit,
            {
                properties: {
                    subject: {
                        description: 'The subject of the thread',
                        type: 'string',
                    },
                    participants: {
                        description: 'The participants in the thread',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    type: {
                        description: 'The type of thread',
                        type: 'string',
                        enum: ['agent-to-agent', 'agent-to-user', 'broadcast'],
                    },
                    metadata: {
                        description: 'Additional metadata for the thread',
                        type: 'object',
                    },
                },
                required: ['subject', 'participants'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailFindOrCreateThreadToolParams,
    ): ToolInvocation<MailFindOrCreateThreadToolParams, ToolResult> {
        return new MailFindOrCreateThreadToolInvocation(params);
    }
}
