/**
 * Review Approve Tool - Approves a merge request
 * Wraps the SDK's reviewMergeRequestService.addReview() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequestService from '../../modules/reviewMergeRequest';

/**
 * Parameters for the ReviewApprove tool
 */
export interface ReviewApproveToolParams {
    /**
     * The ID of the review to approve
     */
    review_id: string;

    /**
     * The ID of the agent approving the review
     */
    agent_id: string;

    /**
     * The name of the agent approving the review
     */
    agent_name: string;

    /**
     * Optional comment to accompany the approval
     */
    comment?: string;
}

class ReviewApproveToolInvocation extends BaseToolInvocation<
    ReviewApproveToolParams,
    ToolResult
> {
    constructor(params: ReviewApproveToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await reviewMergeRequestService.addReview(
                this.params.review_id,
                {
                    agentId: this.params.agent_id,
                    agentName: this.params.agent_name,
                    type: 'approve',
                    comment: this.params.comment || 'Approved',
                }
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully approved review: ${this.params.review_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error approving review: ${errorMessage}`,
                returnDisplay: `Error approving review: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewApprove tool logic
 */
export class ReviewApproveTool extends BaseDeclarativeTool<
    ReviewApproveToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_approve';

    constructor() {
        super(
            ReviewApproveTool.Name,
            'ReviewApprove',
            `Approves a merge request review. Adds an approval feedback from the specified agent with an optional comment. This indicates that the changes are acceptable and ready for merge.`,
            Kind.Execute,
            {
                properties: {
                    review_id: {
                        description: 'The unique identifier of the review to approve',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent approving the review',
                        type: 'string',
                    },
                    agent_name: {
                        description: 'The name of the agent approving the review',
                        type: 'string',
                    },
                    comment: {
                        description: 'Optional comment to accompany the approval',
                        type: 'string',
                    },
                },
                required: ['review_id', 'agent_id', 'agent_name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewApproveToolParams,
    ): string | null {
        if (!params.review_id.trim()) {
            return "The 'review_id' parameter must be non-empty.";
        }

        if (!params.agent_id.trim()) {
            return "The 'agent_id' parameter must be non-empty.";
        }

        if (!params.agent_name.trim()) {
            return "The 'agent_name' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: ReviewApproveToolParams,
    ): ToolInvocation<ReviewApproveToolParams, ToolResult> {
        return new ReviewApproveToolInvocation(params);
    }
}
