/**
 * Portfolio Update Testimonial Tool
 * 
 * Updates an existing testimonial.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for updating a testimonial
 */
export interface PortfolioUpdateTestimonialParams {
    /** The ID of the testimonial to update */
    testimonialId: string;
    /** The new testimonial content */
    content: string;
}

class PortfolioUpdateTestimonialInvocation extends BaseToolInvocation<PortfolioUpdateTestimonialParams, ToolResult> {
    constructor(params: PortfolioUpdateTestimonialParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.updateTestimonial(
                this.params.testimonialId,
                this.params.content
            );

            if (!response.success) {
                const errorMsg = response.error || 'Failed to update testimonial';
                return {
                    llmContent: `Error: Failed to update testimonial - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated testimonial ${this.params.testimonialId}`,
                returnDisplay: `Updated testimonial ${this.params.testimonialId}`,
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
 * Tool for updating a testimonial
 */
export class PortfolioUpdateTestimonialTool extends BaseDeclarativeTool<PortfolioUpdateTestimonialParams, ToolResult> {
    constructor() {
        super(
            'portfolio_update_testimonial',
            'Update Portfolio Testimonial',
            'Updates an existing testimonial with new content.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    testimonialId: {
                        type: 'string',
                        description: 'The ID of the testimonial to update',
                    },
                    content: {
                        type: 'string',
                        description: 'The new testimonial content',
                    },
                },
                required: ['testimonialId', 'content'],
            }
        );
    }

    protected override createInvocation(params: PortfolioUpdateTestimonialParams): ToolInvocation<PortfolioUpdateTestimonialParams, ToolResult> {
        return new PortfolioUpdateTestimonialInvocation(params);
    }
}
