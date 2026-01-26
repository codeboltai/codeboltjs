/**
 * Portfolio Get Talents Tool
 * 
 * Retrieves talents for an agent or all talents.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for getting talents
 */
export interface PortfolioGetTalentsParams {
    /** Optional agent ID to get talents for */
    agentId?: string;
}

class PortfolioGetTalentsInvocation extends BaseToolInvocation<PortfolioGetTalentsParams, ToolResult> {
    constructor(params: PortfolioGetTalentsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.getTalents(this.params.agentId);

            if (!response.success) {
                const errorMsg = response.error || 'Failed to get talents';
                return {
                    llmContent: `Error: Failed to get talents - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const talents = response.data || [];

            const scope = this.params.agentId ? `for agent ${this.params.agentId}` : 'all talents';
            return {
                llmContent: `Retrieved ${talents.length} talents ${scope}`,
                returnDisplay: `Retrieved ${talents.length} talents`,
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
 * Tool for getting talents
 */
export class PortfolioGetTalentsTool extends BaseDeclarativeTool<PortfolioGetTalentsParams, ToolResult> {
    constructor() {
        super(
            'portfolio_get_talents',
            'Get Portfolio Talents',
            'Retrieves talents for a specific agent or all talents if no agent ID is provided.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    agentId: {
                        type: 'string',
                        description: 'Optional agent ID to get talents for',
                    },
                },
                required: [],
            }
        );
    }

    protected override createInvocation(params: PortfolioGetTalentsParams): ToolInvocation<PortfolioGetTalentsParams, ToolResult> {
        return new PortfolioGetTalentsInvocation(params);
    }
}
