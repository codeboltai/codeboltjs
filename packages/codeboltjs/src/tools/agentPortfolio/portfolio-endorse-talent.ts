/**
 * Portfolio Endorse Talent Tool
 * 
 * Endorses a talent skill.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for endorsing a talent
 */
export interface PortfolioEndorseTalentParams {
    /** The ID of the talent to endorse */
    talentId: string;
}

class PortfolioEndorseTalentInvocation extends BaseToolInvocation<PortfolioEndorseTalentParams, ToolResult> {
    constructor(params: PortfolioEndorseTalentParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.endorseTalent(this.params.talentId);

            const endorsement = response.payload?.endorsement;

            if (!endorsement) {
                return {
                    llmContent: 'Error: Failed to endorse talent - no endorsement returned',
                    returnDisplay: 'Error: Failed to endorse talent',
                    error: {
                        message: 'No endorsement returned from endorse operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully endorsed talent ${this.params.talentId}`,
                returnDisplay: `Endorsed talent ${this.params.talentId}`,
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
 * Tool for endorsing a talent
 */
export class PortfolioEndorseTalentTool extends BaseDeclarativeTool<PortfolioEndorseTalentParams, ToolResult> {
    constructor() {
        super(
            'portfolio_endorse_talent',
            'Endorse Portfolio Talent',
            'Endorses a talent skill.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    talentId: {
                        type: 'string',
                        description: 'The ID of the talent to endorse',
                    },
                },
                required: ['talentId'],
            }
        );
    }

    protected override createInvocation(params: PortfolioEndorseTalentParams): ToolInvocation<PortfolioEndorseTalentParams, ToolResult> {
        return new PortfolioEndorseTalentInvocation(params);
    }
}
