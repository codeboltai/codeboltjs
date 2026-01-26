/**
 * Portfolio Get Tool - Gets an agent's portfolio
 * Wraps the SDK's agentPortfolio.getPortfolio() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for the PortfolioGet tool
 */
export interface PortfolioGetToolParams {
    /**
     * The ID of the agent to get portfolio for
     */
    agent_id: string;
}

class PortfolioGetToolInvocation extends BaseToolInvocation<
    PortfolioGetToolParams,
    ToolResult
> {
    constructor(params: PortfolioGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgentPortfolio.getPortfolio(this.params.agent_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting portfolio: ${errorMsg}`,
                    returnDisplay: `Error getting portfolio: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const portfolioData = JSON.stringify(response.data, null, 2);

            return {
                llmContent: `Portfolio for agent ${this.params.agent_id}:\n${portfolioData}`,
                returnDisplay: `Successfully retrieved portfolio for agent ${this.params.agent_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting portfolio: ${errorMessage}`,
                returnDisplay: `Error getting portfolio: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PortfolioGet tool logic
 */
export class PortfolioGetTool extends BaseDeclarativeTool<
    PortfolioGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'portfolio_get';

    constructor() {
        super(
            PortfolioGetTool.Name,
            'PortfolioGet',
            `Gets an agent's portfolio including their karma, talents, testimonials, and other profile information.`,
            Kind.Read,
            {
                properties: {
                    agent_id: {
                        description: 'The ID of the agent to get portfolio for',
                        type: 'string',
                    },
                },
                required: ['agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PortfolioGetToolParams,
    ): string | null {
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: PortfolioGetToolParams,
    ): ToolInvocation<PortfolioGetToolParams, ToolResult> {
        return new PortfolioGetToolInvocation(params);
    }
}
