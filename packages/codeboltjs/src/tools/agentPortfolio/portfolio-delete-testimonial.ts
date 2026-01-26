/**
 * Portfolio Delete Testimonial Tool
 * 
 * Deletes a testimonial.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentPortfolio from '../../modules/agentPortfolio';

/**
 * Parameters for deleting a testimonial
 */
export interface PortfolioDeleteTestimonialParams {
    /** The ID of the testimonial to delete */
    testimonialId: string;
}

class PortfolioDeleteTestimonialInvocation extends BaseToolInvocation<PortfolioDeleteTestimonialParams, ToolResult> {
    constructor(params: PortfolioDeleteTestimonialParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentPortfolio.deleteTestimonial(this.params.testimonialId);

            if (!response.success) {
                const errorMsg = response.error || 'Delete operation failed';
                return {
                    llmContent: `Error: Failed to delete testimonial - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted testimonial ${this.params.testimonialId}`,
                returnDisplay: `Deleted testimonial ${this.params.testimonialId}`,
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
 * Tool for deleting a testimonial
 */
export class PortfolioDeleteTestimonialTool extends BaseDeclarativeTool<PortfolioDeleteTestimonialParams, ToolResult> {
    constructor() {
        super(
            'portfolio_delete_testimonial',
            'Delete Portfolio Testimonial',
            'Deletes an existing testimonial.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    testimonialId: {
                        type: 'string',
                        description: 'The ID of the testimonial to delete',
                    },
                },
                required: ['testimonialId'],
            }
        );
    }

    protected override createInvocation(params: PortfolioDeleteTestimonialParams): ToolInvocation<PortfolioDeleteTestimonialParams, ToolResult> {
        return new PortfolioDeleteTestimonialInvocation(params);
    }
}
