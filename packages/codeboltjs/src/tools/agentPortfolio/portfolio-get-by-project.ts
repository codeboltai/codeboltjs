/**
 * Portfolio Get By Project Tool
 * 
 * Retrieves portfolios by project.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for getting portfolios by project
 */
export interface PortfolioGetByProjectParams {
    /** The project ID */
    projectId: string;
}

class PortfolioGetByProjectInvocation extends BaseToolInvocation<PortfolioGetByProjectParams, ToolResult> {
    constructor(params: PortfolioGetByProjectParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.getPortfoliosByProject(this.params.projectId);

            const portfolios = response.payload?.portfolios;

            if (!portfolios) {
                return {
                    llmContent: 'Error: Failed to get portfolios - no portfolios returned',
                    returnDisplay: 'Error: Failed to get portfolios',
                    error: {
                        message: 'No portfolios returned from get operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Retrieved ${portfolios.length} portfolios for project ${this.params.projectId}`,
                returnDisplay: `Retrieved ${portfolios.length} portfolios`,
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
 * Tool for getting portfolios by project
 */
export class PortfolioGetByProjectTool extends BaseDeclarativeTool<PortfolioGetByProjectParams, ToolResult> {
    constructor() {
        super(
            'portfolio_get_by_project',
            'Get Portfolios By Project',
            'Retrieves all portfolios associated with a specific project.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    projectId: {
                        type: 'string',
                        description: 'The project ID',
                    },
                },
                required: ['projectId'],
            }
        );
    }

    protected override createInvocation(params: PortfolioGetByProjectParams): ToolInvocation<PortfolioGetByProjectParams, ToolResult> {
        return new PortfolioGetByProjectInvocation(params);
    }
}
