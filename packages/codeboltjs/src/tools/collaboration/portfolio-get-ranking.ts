/**
 * Portfolio Get Ranking Tool - Gets agent rankings
 * Wraps the SDK's agentPortfolio.getRanking() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for the PortfolioGetRanking tool
 */
export interface PortfolioGetRankingToolParams {
    /**
     * Maximum number of entries to return
     */
    limit?: number;

    /**
     * What to sort by (karma, testimonials, endorsements)
     */
    sort_by?: 'karma' | 'testimonials' | 'endorsements';
}

class PortfolioGetRankingToolInvocation extends BaseToolInvocation<
    PortfolioGetRankingToolParams,
    ToolResult
> {
    constructor(params: PortfolioGetRankingToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgentPortfolio.getRanking(
                this.params.limit,
                this.params.sort_by
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error getting ranking: ${errorMsg}`,
                    returnDisplay: `Error getting ranking: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const rankingData = JSON.stringify(response.ranking, null, 2);
            const sortByInfo = this.params.sort_by ? ` sorted by ${this.params.sort_by}` : '';
            const limitInfo = this.params.limit ? ` (top ${this.params.limit})` : '';

            return {
                llmContent: `Agent ranking${sortByInfo}${limitInfo}:\n${rankingData}`,
                returnDisplay: `Successfully retrieved agent ranking${sortByInfo}${limitInfo}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting ranking: ${errorMessage}`,
                returnDisplay: `Error getting ranking: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PortfolioGetRanking tool logic
 */
export class PortfolioGetRankingTool extends BaseDeclarativeTool<
    PortfolioGetRankingToolParams,
    ToolResult
> {
    static readonly Name: string = 'portfolio_get_ranking';

    constructor() {
        super(
            PortfolioGetRankingTool.Name,
            'PortfolioGetRanking',
            `Gets the agent ranking/leaderboard. Rankings can be sorted by karma, testimonials, or endorsements to find top-performing agents.`,
            Kind.Read,
            {
                properties: {
                    limit: {
                        description: 'Maximum number of entries to return in the ranking',
                        type: 'number',
                    },
                    sort_by: {
                        description: 'What to sort the ranking by',
                        type: 'string',
                        enum: ['karma', 'testimonials', 'endorsements'],
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PortfolioGetRankingToolParams,
    ): string | null {
        if (params.limit !== undefined && (typeof params.limit !== 'number' || params.limit <= 0)) {
            return "The 'limit' parameter must be a positive number.";
        }
        if (params.sort_by !== undefined && !['karma', 'testimonials', 'endorsements'].includes(params.sort_by)) {
            return "The 'sort_by' parameter must be one of: karma, testimonials, endorsements.";
        }
        return null;
    }

    protected createInvocation(
        params: PortfolioGetRankingToolParams,
    ): ToolInvocation<PortfolioGetRankingToolParams, ToolResult> {
        return new PortfolioGetRankingToolInvocation(params);
    }
}
