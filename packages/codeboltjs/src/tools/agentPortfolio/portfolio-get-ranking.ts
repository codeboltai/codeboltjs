/**
 * Portfolio Get Ranking Tool
 * 
 * Retrieves agent ranking/leaderboard.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for getting ranking
 */
export interface PortfolioGetRankingParams {
    /** Maximum number of entries to return */
    limit?: number;
    /** What to sort by (karma, testimonials, endorsements) */
    sortBy?: 'karma' | 'testimonials' | 'endorsements';
}

class PortfolioGetRankingInvocation extends BaseToolInvocation<PortfolioGetRankingParams, ToolResult> {
    constructor(params: PortfolioGetRankingParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.getRanking(
                this.params.limit,
                this.params.sortBy
            );

            const ranking = response.payload?.ranking;

            if (!ranking) {
                return {
                    llmContent: 'Error: Failed to get ranking - no ranking returned',
                    returnDisplay: 'Error: Failed to get ranking',
                    error: {
                        message: 'No ranking returned from get operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const sortInfo = this.params.sortBy ? ` sorted by ${this.params.sortBy}` : '';
            return {
                llmContent: `Retrieved ${ranking.length} agents in ranking${sortInfo}`,
                returnDisplay: `Retrieved ${ranking.length} agents in ranking`,
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
 * Tool for getting agent ranking
 */
export class PortfolioGetRankingTool extends BaseDeclarativeTool<PortfolioGetRankingParams, ToolResult> {
    constructor() {
        super(
            'portfolio_get_ranking',
            'Get Portfolio Ranking',
            'Retrieves agent ranking/leaderboard with optional sorting and limit.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description: 'Maximum number of entries to return',
                    },
                    sortBy: {
                        type: 'string',
                        enum: ['karma', 'testimonials', 'endorsements'],
                        description: 'What to sort by',
                    },
                },
                required: [],
            }
        );
    }

    protected override createInvocation(params: PortfolioGetRankingParams): ToolInvocation<PortfolioGetRankingParams, ToolResult> {
        return new PortfolioGetRankingInvocation(params);
    }
}
