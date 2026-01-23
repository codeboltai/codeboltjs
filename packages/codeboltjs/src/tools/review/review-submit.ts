/**
 * Review Submit Tool - Submits a review
 * Wraps the SDK's reviewMergeRequestService.updateStatus() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequestService from '../../modules/reviewMergeRequest';

/**
 * Parameters for the ReviewSubmit tool
 */
export interface ReviewSubmitToolParams {
    /**
     * The ID of the review to submit
     */
    review_id: string;
}

class ReviewSubmitToolInvocation extends BaseToolInvocation<
    ReviewSubmitToolParams,
    ToolResult
> {
    constructor(params: ReviewSubmitToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Submit the review by changing its status to 'pending_review'
            const response = await reviewMergeRequestService.updateStatus(
                this.params.review_id,
                'pending_review'
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully submitted review: ${this.params.review_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error submitting review: ${errorMessage}`,
                returnDisplay: `Error submitting review: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewSubmit tool logic
 */
export class ReviewSubmitTool extends BaseDeclarativeTool<
    ReviewSubmitToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_submit';

    constructor() {
        super(
            ReviewSubmitTool.Name,
            'ReviewSubmit',
            `Submits a merge request review for review. This changes the review status from 'draft' to 'pending_review', making it visible to reviewers.`,
            Kind.Execute,
            {
                properties: {
                    review_id: {
                        description: 'The unique identifier of the review to submit',
                        type: 'string',
                    },
                },
                required: ['review_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewSubmitToolParams,
    ): string | null {
        if (!params.review_id.trim()) {
            return "The 'review_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: ReviewSubmitToolParams,
    ): ToolInvocation<ReviewSubmitToolParams, ToolResult> {
        return new ReviewSubmitToolInvocation(params);
    }
}
