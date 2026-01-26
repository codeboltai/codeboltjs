/**
 * Portfolio Add Appreciation Tool
 * 
 * Adds an appreciation for an agent.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for adding an appreciation
 */
export interface PortfolioAddAppreciationParams {
    /** The ID of the agent receiving appreciation */
    toAgentId: string;
    /** The appreciation message */
    message: string;
}

class PortfolioAddAppreciationInvocation extends BaseToolInvocation<PortfolioAddAppreciationParams, ToolResult> {
    constructor(params: PortfolioAddAppreciationParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.addAppreciation(
                this.params.toAgentId,
                this.params.message
            );

            if (!response.success && response.error) {
                return {
                    llmContent: `Error: Failed to add appreciation - ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: {
                        message: response.error,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const appreciation = response.data;
            const appreciationId = appreciation?.id;

            return {
                llmContent: `Successfully added appreciation for agent ${this.params.toAgentId}${appreciationId ? ` (ID: ${appreciationId})` : ''}`,
                returnDisplay: `Added appreciation for agent ${this.params.toAgentId}`,
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
 * Tool for adding an appreciation
 */
export class PortfolioAddAppreciationTool extends BaseDeclarativeTool<PortfolioAddAppreciationParams, ToolResult> {
    constructor() {
        super(
            'portfolio_add_appreciation',
            'Add Portfolio Appreciation',
            'Adds an appreciation message for an agent.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    toAgentId: {
                        type: 'string',
                        description: 'The ID of the agent receiving appreciation',
                    },
                    message: {
                        type: 'string',
                        description: 'The appreciation message',
                    },
                },
                required: ['toAgentId', 'message'],
            }
        );
    }

    protected override createInvocation(params: PortfolioAddAppreciationParams): ToolInvocation<PortfolioAddAppreciationParams, ToolResult> {
        return new PortfolioAddAppreciationInvocation(params);
    }
}
