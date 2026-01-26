/**
 * Portfolio Get Conversations Tool
 * 
 * Retrieves conversations involving an agent.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for getting agent conversations
 */
export interface PortfolioGetConversationsParams {
    /** The ID of the agent */
    agentId: string;
    /** Maximum number of conversations to return */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}

class PortfolioGetConversationsInvocation extends BaseToolInvocation<PortfolioGetConversationsParams, ToolResult> {
    constructor(params: PortfolioGetConversationsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.getConversations(
                this.params.agentId,
                this.params.limit,
                this.params.offset
            );

            if (!response.success) {
                const errorMsg = response.error || 'Failed to get conversations';
                return {
                    llmContent: `Error: Failed to get conversations - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const conversations = response.data || [];

            return {
                llmContent: `Retrieved ${conversations.length} conversations for agent ${this.params.agentId}`,
                returnDisplay: `Retrieved ${conversations.length} conversations`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
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
 * Tool for getting agent conversations
 */
export class PortfolioGetConversationsTool extends BaseDeclarativeTool<PortfolioGetConversationsParams, ToolResult> {
    constructor() {
        super(
            'portfolio_get_conversations',
            'Get Portfolio Conversations',
            'Retrieves conversations involving an agent with optional pagination.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    agentId: {
                        type: 'string',
                        description: 'The ID of the agent',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of conversations to return',
                    },
                    offset: {
                        type: 'number',
                        description: 'Offset for pagination',
                    },
                },
                required: ['agentId'],
            }
        );
    }

    protected override createInvocation(params: PortfolioGetConversationsParams): ToolInvocation<PortfolioGetConversationsParams, ToolResult> {
        return new PortfolioGetConversationsInvocation(params);
    }
}
