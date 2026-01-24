/**
 * Mail List Agents Tool - Lists all registered agents in the mail system
 * Wraps the SDK's cbmail.listAgents() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailListAgents tool
 */
export interface MailListAgentsToolParams {
    // No parameters required
}

class MailListAgentsToolInvocation extends BaseToolInvocation<
    MailListAgentsToolParams,
    ToolResult
> {
    constructor(params: MailListAgentsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.listAgents();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully listed agents',
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
 * Implementation of the MailListAgents tool
 */
export class MailListAgentsTool extends BaseDeclarativeTool<
    MailListAgentsToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_list_agents';

    constructor() {
        super(
            MailListAgentsTool.Name,
            'MailListAgents',
            'Lists all registered agents in the mail system.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailListAgentsToolParams,
    ): ToolInvocation<MailListAgentsToolParams, ToolResult> {
        return new MailListAgentsToolInvocation(params);
    }
}
