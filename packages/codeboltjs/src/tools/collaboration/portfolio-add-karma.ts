/**
 * Portfolio Add Karma Tool - Adds karma points to an agent
 * Wraps the SDK's agentPortfolio.addKarma() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for the PortfolioAddKarma tool
 */
export interface PortfolioAddKarmaToolParams {
    /**
     * The ID of the agent receiving karma
     */
    to_agent_id: string;

    /**
     * The amount of karma to add (can be negative)
     */
    amount: number;

    /**
     * Optional reason for the karma change
     */
    reason?: string;
}

class PortfolioAddKarmaToolInvocation extends BaseToolInvocation<
    PortfolioAddKarmaToolParams,
    ToolResult
> {
    constructor(params: PortfolioAddKarmaToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgentPortfolio.addKarma(
                this.params.to_agent_id,
                this.params.amount,
                this.params.reason
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error adding karma: ${errorMsg}`,
                    returnDisplay: `Error adding karma: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const responseData = JSON.stringify(response, null, 2);

            return {
                llmContent: `Successfully added ${this.params.amount} karma to agent ${this.params.to_agent_id}:\n${responseData}`,
                returnDisplay: `Successfully added ${this.params.amount} karma to agent ${this.params.to_agent_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding karma: ${errorMessage}`,
                returnDisplay: `Error adding karma: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PortfolioAddKarma tool logic
 */
export class PortfolioAddKarmaTool extends BaseDeclarativeTool<
    PortfolioAddKarmaToolParams,
    ToolResult
> {
    static readonly Name: string = 'portfolio_add_karma';

    constructor() {
        super(
            PortfolioAddKarmaTool.Name,
            'PortfolioAddKarma',
            `Adds karma points to an agent's portfolio. Karma is a reputation metric that can be positive or negative based on the agent's contributions and behavior.`,
            Kind.Edit,
            {
                properties: {
                    to_agent_id: {
                        description: 'The ID of the agent receiving karma',
                        type: 'string',
                    },
                    amount: {
                        description: 'The amount of karma to add (can be negative for deductions)',
                        type: 'number',
                    },
                    reason: {
                        description: 'Optional reason for the karma change',
                        type: 'string',
                    },
                },
                required: ['to_agent_id', 'amount'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PortfolioAddKarmaToolParams,
    ): string | null {
        if (!params.to_agent_id || params.to_agent_id.trim() === '') {
            return "The 'to_agent_id' parameter must be non-empty.";
        }
        if (typeof params.amount !== 'number') {
            return "The 'amount' parameter must be a number.";
        }
        return null;
    }

    protected createInvocation(
        params: PortfolioAddKarmaToolParams,
    ): ToolInvocation<PortfolioAddKarmaToolParams, ToolResult> {
        return new PortfolioAddKarmaToolInvocation(params);
    }
}
