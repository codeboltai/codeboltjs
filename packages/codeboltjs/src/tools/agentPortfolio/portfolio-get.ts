/**
 * Portfolio Get Tool
 * 
 * Retrieves the portfolio of an agent including karma, testimonials, talents, and appreciations.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for getting an agent portfolio
 */
export interface PortfolioGetParams {
    /** The ID of the agent */
    agentId: string;
}

class PortfolioGetInvocation extends BaseToolInvocation<PortfolioGetParams, ToolResult> {
    constructor(params: PortfolioGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.getPortfolio(this.params.agentId);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error: Failed to get portfolio - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const portfolio = response.data;

            if (!portfolio) {
                return {
                    llmContent: 'Error: Failed to get portfolio - no portfolio returned',
                    returnDisplay: 'Error: Failed to get portfolio',
                    error: {
                        message: 'No portfolio returned from get operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Portfolio for agent ${portfolio.agentId}:\nKarma: ${portfolio.karma}\nTestimonials: ${portfolio.testimonials?.length || 0}\nTalents: ${portfolio.talents?.length || 0}\nAppreciations: ${portfolio.appreciations?.length || 0}`,
                returnDisplay: `Portfolio for agent ${portfolio.agentId}`,
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
 * Tool for getting an agent portfolio
 */
export class PortfolioGetTool extends BaseDeclarativeTool<PortfolioGetParams, ToolResult> {
    constructor() {
        super(
            'portfolio_get',
            'Get Portfolio',
            'Retrieves the portfolio of an agent including karma, testimonials, talents, and appreciations.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    agentId: {
                        type: 'string',
                        description: 'The ID of the agent',
                    },
                },
                required: ['agentId'],
            }
        );
    }

    protected override createInvocation(params: PortfolioGetParams): ToolInvocation<PortfolioGetParams, ToolResult> {
        return new PortfolioGetInvocation(params);
    }
}
