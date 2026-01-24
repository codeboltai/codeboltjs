/**
 * Mail Get Agent Tool - Gets details of a specific agent
 * Wraps the SDK's cbmail.getAgent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailGetAgent tool
 */
export interface MailGetAgentToolParams {
    /**
     * The unique identifier of the agent to retrieve
     */
    agentId: string;
}

class MailGetAgentToolInvocation extends BaseToolInvocation<
    MailGetAgentToolParams,
    ToolResult
> {
    constructor(params: MailGetAgentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.getAgent(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved agent',
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
 * Implementation of the MailGetAgent tool
 */
export class MailGetAgentTool extends BaseDeclarativeTool<
    MailGetAgentToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_get_agent';

    constructor() {
        super(
            MailGetAgentTool.Name,
            'MailGetAgent',
            'Gets details of a specific agent by its ID.',
            Kind.Read,
            {
                properties: {
                    agentId: {
                        description: 'The unique identifier of the agent to retrieve',
                        type: 'string',
                    },
                },
                required: ['agentId'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailGetAgentToolParams,
    ): ToolInvocation<MailGetAgentToolParams, ToolResult> {
        return new MailGetAgentToolInvocation(params);
    }
}
