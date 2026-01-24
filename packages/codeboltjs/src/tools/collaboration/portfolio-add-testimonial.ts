/**
 * Portfolio Add Testimonial Tool - Adds a testimonial to an agent's portfolio
 * Wraps the SDK's agentPortfolio.addTestimonial() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for the PortfolioAddTestimonial tool
 */
export interface PortfolioAddTestimonialToolParams {
    /**
     * The ID of the agent receiving the testimonial
     */
    to_agent_id: string;

    /**
     * The testimonial content
     */
    content: string;

    /**
     * Optional project ID to associate with the testimonial
     */
    project_id?: string;
}

class PortfolioAddTestimonialToolInvocation extends BaseToolInvocation<
    PortfolioAddTestimonialToolParams,
    ToolResult
> {
    constructor(params: PortfolioAddTestimonialToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgentPortfolio.addTestimonial(
                this.params.to_agent_id,
                this.params.content,
                this.params.project_id
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error adding testimonial: ${errorMsg}`,
                    returnDisplay: `Error adding testimonial: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const responseData = JSON.stringify(response, null, 2);

            return {
                llmContent: `Successfully added testimonial for agent ${this.params.to_agent_id}:\n${responseData}`,
                returnDisplay: `Successfully added testimonial for agent ${this.params.to_agent_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding testimonial: ${errorMessage}`,
                returnDisplay: `Error adding testimonial: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PortfolioAddTestimonial tool logic
 */
export class PortfolioAddTestimonialTool extends BaseDeclarativeTool<
    PortfolioAddTestimonialToolParams,
    ToolResult
> {
    static readonly Name: string = 'portfolio_add_testimonial';

    constructor() {
        super(
            PortfolioAddTestimonialTool.Name,
            'PortfolioAddTestimonial',
            `Adds a testimonial to an agent's portfolio. Testimonials are written recommendations from other agents or users about the agent's work and capabilities.`,
            Kind.Edit,
            {
                properties: {
                    to_agent_id: {
                        description: 'The ID of the agent receiving the testimonial',
                        type: 'string',
                    },
                    content: {
                        description: 'The testimonial content describing the agent\'s work or capabilities',
                        type: 'string',
                    },
                    project_id: {
                        description: 'Optional project ID to associate with the testimonial',
                        type: 'string',
                    },
                },
                required: ['to_agent_id', 'content'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PortfolioAddTestimonialToolParams,
    ): string | null {
        if (!params.to_agent_id || params.to_agent_id.trim() === '') {
            return "The 'to_agent_id' parameter must be non-empty.";
        }
        if (!params.content || params.content.trim() === '') {
            return "The 'content' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: PortfolioAddTestimonialToolParams,
    ): ToolInvocation<PortfolioAddTestimonialToolParams, ToolResult> {
        return new PortfolioAddTestimonialToolInvocation(params);
    }
}
