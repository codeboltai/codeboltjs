/**
 * Mail Create Thread Tool - Creates a new mail thread
 * Wraps the SDK's cbmail.createThread() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailCreateThread tool
 */
export interface MailCreateThreadToolParams {
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

class MailCreateThreadToolInvocation extends BaseToolInvocation<
    MailCreateThreadToolParams,
    ToolResult
> {
    constructor(params: MailCreateThreadToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.createThread(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully created thread',
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
 * Implementation of the MailCreateThread tool
 */
export class MailCreateThreadTool extends BaseDeclarativeTool<
    MailCreateThreadToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_create_thread';

    constructor() {
        super(
            MailCreateThreadTool.Name,
            'MailCreateThread',
            'Creates a new mail thread with specified subject, participants, and optional type.',
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
        params: MailCreateThreadToolParams,
    ): ToolInvocation<MailCreateThreadToolParams, ToolResult> {
        return new MailCreateThreadToolInvocation(params);
    }
}
