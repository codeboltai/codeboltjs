/**
 * Mail Register Agent Tool - Registers an agent in the mail system
 * Wraps the SDK's cbmail.registerAgent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailRegisterAgent tool
 */
export interface MailRegisterAgentToolParams {
    /**
     * The unique identifier for the agent
     */
    agentId: string;

    /**
     * The name of the agent
     */
    name: string;

    /**
     * The capabilities of the agent
     */
    capabilities?: string[];

    /**
     * Additional metadata for the agent
     */
    metadata?: Record<string, unknown>;
}

class MailRegisterAgentToolInvocation extends BaseToolInvocation<
    MailRegisterAgentToolParams,
    ToolResult
> {
    constructor(params: MailRegisterAgentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.registerAgent(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully registered agent',
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
 * Implementation of the MailRegisterAgent tool
 */
export class MailRegisterAgentTool extends BaseDeclarativeTool<
    MailRegisterAgentToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_register_agent';

    constructor() {
        super(
            MailRegisterAgentTool.Name,
            'MailRegisterAgent',
            'Registers an agent in the mail system with specified capabilities and metadata.',
            Kind.Edit,
            {
                properties: {
                    agentId: {
                        description: 'The unique identifier for the agent',
                        type: 'string',
                    },
                    name: {
                        description: 'The name of the agent',
                        type: 'string',
                    },
                    capabilities: {
                        description: 'The capabilities of the agent',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    metadata: {
                        description: 'Additional metadata for the agent',
                        type: 'object',
                    },
                },
                required: ['agentId', 'name'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailRegisterAgentToolParams,
    ): ToolInvocation<MailRegisterAgentToolParams, ToolResult> {
        return new MailRegisterAgentToolInvocation(params);
    }
}
