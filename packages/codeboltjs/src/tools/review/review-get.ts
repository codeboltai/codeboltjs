/**
 * Review Get Tool - Gets a review by ID
 * Wraps the SDK's reviewMergeRequestService.get() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequestService from '../../modules/reviewMergeRequest';

/**
 * Parameters for the ReviewGet tool
 */
export interface ReviewGetToolParams {
    /**
     * The ID of the review to retrieve
     */
    review_id: string;
}

class ReviewGetToolInvocation extends BaseToolInvocation<
    ReviewGetToolParams,
    ToolResult
> {
    constructor(params: ReviewGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await reviewMergeRequestService.get(this.params.review_id);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved review: ${this.params.review_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting review: ${errorMessage}`,
                returnDisplay: `Error getting review: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewGet tool logic
 */
export class ReviewGetTool extends BaseDeclarativeTool<
    ReviewGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_get';

    constructor() {
        super(
            ReviewGetTool.Name,
            'ReviewGet',
            `Gets a single merge request review by its ID. Returns the full review details including status, description, files changed, reviews received, and merge information.`,
            Kind.Read,
            {
                properties: {
                    review_id: {
                        description: 'The unique identifier of the review to retrieve',
                        type: 'string',
                    },
                },
                required: ['review_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewGetToolParams,
    ): string | null {
        if (!params.review_id.trim()) {
            return "The 'review_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: ReviewGetToolParams,
    ): ToolInvocation<ReviewGetToolParams, ToolResult> {
        return new ReviewGetToolInvocation(params);
    }
}
