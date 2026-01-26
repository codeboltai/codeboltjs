/**
 * Mail Acknowledge Tool - Acknowledges receipt of messages
 * Wraps the SDK's cbmail.acknowledge() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailAcknowledge tool
 */
export interface MailAcknowledgeToolParams {
    /**
     * The message IDs to acknowledge
     */
    messageIds: string[];

    /**
     * The agent ID acknowledging the messages
     */
    agentId: string;
}

class MailAcknowledgeToolInvocation extends BaseToolInvocation<
    MailAcknowledgeToolParams,
    ToolResult
> {
    constructor(params: MailAcknowledgeToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Map messageIds to messageId for the SDK call
            const response = await mailService.acknowledge({
                messageId: this.params.messageIds[0], // SDK expects single messageId
                agentId: this.params.agentId,
            } as any);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully acknowledged ${this.params.messageIds.length} message(s)`,
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
 * Implementation of the MailAcknowledge tool
 */
export class MailAcknowledgeTool extends BaseDeclarativeTool<
    MailAcknowledgeToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_acknowledge';

    constructor() {
        super(
            MailAcknowledgeTool.Name,
            'MailAcknowledge',
            'Acknowledges receipt of one or more messages.',
            Kind.Edit,
            {
                properties: {
                    messageIds: {
                        description: 'The message IDs to acknowledge',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    agentId: {
                        description: 'The agent ID acknowledging the messages',
                        type: 'string',
                    },
                },
                required: ['messageIds', 'agentId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailAcknowledgeToolParams,
    ): ToolInvocation<MailAcknowledgeToolParams, ToolResult> {
        return new MailAcknowledgeToolInvocation(params);
    }
}
