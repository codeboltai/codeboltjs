/**
 * Portfolio Add Talent Tool - Adds a talent/skill to an agent's portfolio
 * Wraps the SDK's agentPortfolio.addTalent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for the PortfolioAddTalent tool
 */
export interface PortfolioAddTalentToolParams {
    /**
     * The name of the talent/skill
     */
    name: string;

    /**
     * Optional description of the talent
     */
    description?: string;
}

class PortfolioAddTalentToolInvocation extends BaseToolInvocation<
    PortfolioAddTalentToolParams,
    ToolResult
> {
    constructor(params: PortfolioAddTalentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgentPortfolio.addTalent(
                this.params.name,
                this.params.description
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error adding talent: ${errorMsg}`,
                    returnDisplay: `Error adding talent: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const responseData = JSON.stringify(response, null, 2);

            return {
                llmContent: `Successfully added talent "${this.params.name}":\n${responseData}`,
                returnDisplay: `Successfully added talent "${this.params.name}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding talent: ${errorMessage}`,
                returnDisplay: `Error adding talent: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PortfolioAddTalent tool logic
 */
export class PortfolioAddTalentTool extends BaseDeclarativeTool<
    PortfolioAddTalentToolParams,
    ToolResult
> {
    static readonly Name: string = 'portfolio_add_talent';

    constructor() {
        super(
            PortfolioAddTalentTool.Name,
            'PortfolioAddTalent',
            `Adds a talent or skill to an agent's portfolio. Talents represent the agent's capabilities and areas of expertise.`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the talent/skill (e.g., "JavaScript", "Code Review", "Testing")',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description providing more details about the talent',
                        type: 'string',
                    },
                },
                required: ['name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PortfolioAddTalentToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: PortfolioAddTalentToolParams,
    ): ToolInvocation<PortfolioAddTalentToolParams, ToolResult> {
        return new PortfolioAddTalentToolInvocation(params);
    }
}
