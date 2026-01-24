/**
 * Portfolio Add Karma Tool
 * 
 * Adds karma to an agent.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for adding karma
 */
export interface PortfolioAddKarmaParams {
    /** The ID of the agent receiving karma */
    toAgentId: string;
    /** The amount of karma to add (can be negative) */
    amount: number;
    /** Optional reason for the karma change */
    reason?: string;
}

class PortfolioAddKarmaInvocation extends BaseToolInvocation<PortfolioAddKarmaParams, ToolResult> {
    constructor(params: PortfolioAddKarmaParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.addKarma(
                this.params.toAgentId,
                this.params.amount,
                this.params.reason
            );

            const karma = response.payload?.karma;

            if (karma === undefined) {
                return {
                    llmContent: 'Error: Failed to add karma - no karma returned',
                    returnDisplay: 'Error: Failed to add karma',
                    error: {
                        message: 'No karma returned from add operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully added ${this.params.amount} karma to agent ${this.params.toAgentId}. New total: ${karma}${this.params.reason ? `. Reason: ${this.params.reason}` : ''}`,
                returnDisplay: `Added ${this.params.amount} karma to agent ${this.params.toAgentId}`,
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
 * Tool for adding karma to an agent
 */
export class PortfolioAddKarmaTool extends BaseDeclarativeTool<PortfolioAddKarmaParams, ToolResult> {
    constructor() {
        super(
            'portfolio_add_karma',
            'Add Portfolio Karma',
            'Adds karma to an agent. Amount can be positive or negative.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    toAgentId: {
                        type: 'string',
                        description: 'The ID of the agent receiving karma',
                    },
                    amount: {
                        type: 'number',
                        description: 'The amount of karma to add (can be negative)',
                    },
                    reason: {
                        type: 'string',
                        description: 'Optional reason for the karma change',
                    },
                },
                required: ['toAgentId', 'amount'],
            }
        );
    }

    protected override createInvocation(params: PortfolioAddKarmaParams): ToolInvocation<PortfolioAddKarmaParams, ToolResult> {
        return new PortfolioAddKarmaInvocation(params);
    }
}
