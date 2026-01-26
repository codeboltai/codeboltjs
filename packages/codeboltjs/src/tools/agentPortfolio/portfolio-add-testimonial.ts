/**
 * Portfolio Add Testimonial Tool
 * 
 * Adds a testimonial for an agent.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for adding a testimonial
 */
export interface PortfolioAddTestimonialParams {
    /** The ID of the agent receiving the testimonial */
    toAgentId: string;
    /** The testimonial content */
    content: string;
    /** Optional project ID to associate with the testimonial */
    projectId?: string;
}

class PortfolioAddTestimonialInvocation extends BaseToolInvocation<PortfolioAddTestimonialParams, ToolResult> {
    constructor(params: PortfolioAddTestimonialParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.addTestimonial(
                this.params.toAgentId,
                this.params.content,
                this.params.projectId
            );

            if (!response.success && response.error) {
                return {
                    llmContent: `Error: Failed to add testimonial - ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: {
                        message: response.error,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const testimonial = response.data;
            const testimonialId = testimonial?.id;

            return {
                llmContent: `Successfully added testimonial for agent ${this.params.toAgentId}${testimonialId ? ` (ID: ${testimonialId})` : ''}`,
                returnDisplay: `Added testimonial for agent ${this.params.toAgentId}`,
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
 * Tool for adding a testimonial
 */
export class PortfolioAddTestimonialTool extends BaseDeclarativeTool<PortfolioAddTestimonialParams, ToolResult> {
    constructor() {
        super(
            'portfolio_add_testimonial',
            'Add Portfolio Testimonial',
            'Adds a testimonial for an agent, optionally associated with a project.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    toAgentId: {
                        type: 'string',
                        description: 'The ID of the agent receiving the testimonial',
                    },
                    content: {
                        type: 'string',
                        description: 'The testimonial content',
                    },
                    projectId: {
                        type: 'string',
                        description: 'Optional project ID to associate with the testimonial',
                    },
                },
                required: ['toAgentId', 'content'],
            }
        );
    }

    protected override createInvocation(params: PortfolioAddTestimonialParams): ToolInvocation<PortfolioAddTestimonialParams, ToolResult> {
        return new PortfolioAddTestimonialInvocation(params);
    }
}
