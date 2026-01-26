/**
 * Portfolio Get Karma History Tool
 * 
 * Retrieves the karma history of an agent.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for getting karma history
 */
export interface PortfolioGetKarmaHistoryParams {
    /** The ID of the agent */
    agentId: string;
    /** Maximum number of entries to return */
    limit?: number;
}

class PortfolioGetKarmaHistoryInvocation extends BaseToolInvocation<PortfolioGetKarmaHistoryParams, ToolResult> {
    constructor(params: PortfolioGetKarmaHistoryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.getKarmaHistory(
                this.params.agentId,
                this.params.limit
            );

            if (!response.success) {
                const errorMsg = response.error || 'Failed to get karma history';
                return {
                    llmContent: `Error: Failed to get karma history - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const history = response.data || [];

            return {
                llmContent: `Retrieved ${history.length} karma history entries for agent ${this.params.agentId}`,
                returnDisplay: `Retrieved ${history.length} karma history entries`,
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
 * Tool for getting karma history
 */
export class PortfolioGetKarmaHistoryTool extends BaseDeclarativeTool<PortfolioGetKarmaHistoryParams, ToolResult> {
    constructor() {
        super(
            'portfolio_get_karma_history',
            'Get Portfolio Karma History',
            'Retrieves the karma history of an agent with optional limit.',
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
                        description: 'Maximum number of entries to return',
                    },
                },
                required: ['agentId'],
            }
        );
    }

    protected override createInvocation(params: PortfolioGetKarmaHistoryParams): ToolInvocation<PortfolioGetKarmaHistoryParams, ToolResult> {
        return new PortfolioGetKarmaHistoryInvocation(params);
    }
}
