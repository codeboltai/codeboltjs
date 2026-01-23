/**
 * Portfolio Endorse Talent Tool - Endorses a talent on an agent's portfolio
 * Wraps the SDK's agentPortfolio.endorseTalent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for the PortfolioEndorseTalent tool
 */
export interface PortfolioEndorseTalentToolParams {
    /**
     * The ID of the talent to endorse
     */
    talent_id: string;
}

class PortfolioEndorseTalentToolInvocation extends BaseToolInvocation<
    PortfolioEndorseTalentToolParams,
    ToolResult
> {
    constructor(params: PortfolioEndorseTalentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgentPortfolio.endorseTalent(this.params.talent_id);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error endorsing talent: ${errorMsg}`,
                    returnDisplay: `Error endorsing talent: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const responseData = JSON.stringify(response, null, 2);

            return {
                llmContent: `Successfully endorsed talent ${this.params.talent_id}:\n${responseData}`,
                returnDisplay: `Successfully endorsed talent ${this.params.talent_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error endorsing talent: ${errorMessage}`,
                returnDisplay: `Error endorsing talent: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PortfolioEndorseTalent tool logic
 */
export class PortfolioEndorseTalentTool extends BaseDeclarativeTool<
    PortfolioEndorseTalentToolParams,
    ToolResult
> {
    static readonly Name: string = 'portfolio_endorse_talent';

    constructor() {
        super(
            PortfolioEndorseTalentTool.Name,
            'PortfolioEndorseTalent',
            `Endorses a talent on an agent's portfolio. Endorsements validate an agent's claimed skills and increase their credibility.`,
            Kind.Edit,
            {
                properties: {
                    talent_id: {
                        description: 'The ID of the talent to endorse',
                        type: 'string',
                    },
                },
                required: ['talent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PortfolioEndorseTalentToolParams,
    ): string | null {
        if (!params.talent_id || params.talent_id.trim() === '') {
            return "The 'talent_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: PortfolioEndorseTalentToolParams,
    ): ToolInvocation<PortfolioEndorseTalentToolParams, ToolResult> {
        return new PortfolioEndorseTalentToolInvocation(params);
    }
}
