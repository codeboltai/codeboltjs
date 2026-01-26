/**
 * Portfolio Add Talent Tool
 * 
 * Adds a talent skill.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for adding a talent
 */
export interface PortfolioAddTalentParams {
    /** The name of the talent */
    name: string;
    /** Optional description of the talent */
    description?: string;
}

class PortfolioAddTalentInvocation extends BaseToolInvocation<PortfolioAddTalentParams, ToolResult> {
    constructor(params: PortfolioAddTalentParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.addTalent(
                this.params.name,
                this.params.description
            );

            if (!response.success && response.error) {
                return {
                    llmContent: `Error: Failed to add talent - ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: {
                        message: response.error,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const talent = response.data;
            const talentId = talent?.id;

            return {
                llmContent: `Successfully added talent "${this.params.name}"${talentId ? ` (ID: ${talentId})` : ''}`,
                returnDisplay: `Added talent "${this.params.name}"`,
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
 * Tool for adding a talent
 */
export class PortfolioAddTalentTool extends BaseDeclarativeTool<PortfolioAddTalentParams, ToolResult> {
    constructor() {
        super(
            'portfolio_add_talent',
            'Add Portfolio Talent',
            'Adds a talent skill with optional description.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the talent',
                    },
                    description: {
                        type: 'string',
                        description: 'Optional description of the talent',
                    },
                },
                required: ['name'],
            }
        );
    }

    protected override createInvocation(params: PortfolioAddTalentParams): ToolInvocation<PortfolioAddTalentParams, ToolResult> {
        return new PortfolioAddTalentInvocation(params);
    }
}
