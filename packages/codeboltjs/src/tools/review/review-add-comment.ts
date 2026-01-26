/**
 * Review Add Comment Tool - Adds a comment to a review
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
 * Parameters for the ReviewAddComment tool
 */
export interface ReviewAddCommentToolParams {
    /**
     * The ID of the review to add a comment to
     */
    review_id: string;

    /**
     * The ID of the agent adding the comment
     */
    agent_id: string;

    /**
     * The name of the agent adding the comment
     */
    agent_name: string;

    /**
     * The comment text
     */
    comment: string;
}

class ReviewAddCommentToolInvocation extends BaseToolInvocation<
    ReviewAddCommentToolParams,
    ToolResult
> {
    constructor(params: ReviewAddCommentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await reviewMergeRequestService.addReview(
                this.params.review_id,
                {
                    agentId: this.params.agent_id,
                    agentName: this.params.agent_name,
                    type: 'comment',
                    comment: this.params.comment,
                }
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added comment to review: ${this.params.review_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding comment: ${errorMessage}`,
                returnDisplay: `Error adding comment: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewAddComment tool logic
 */
export class ReviewAddCommentTool extends BaseDeclarativeTool<
    ReviewAddCommentToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_add_comment';

    constructor() {
        super(
            ReviewAddCommentTool.Name,
            'ReviewAddComment',
            `Adds a comment to a merge request review. This adds general feedback without approving or requesting changes. Use this for questions, suggestions, or observations about the code changes.`,
            Kind.Edit,
            {
                properties: {
                    review_id: {
                        description: 'The unique identifier of the review to comment on',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent adding the comment',
                        type: 'string',
                    },
                    agent_name: {
                        description: 'The name of the agent adding the comment',
                        type: 'string',
                    },
                    comment: {
                        description: 'The comment text to add to the review',
                        type: 'string',
                    },
                },
                required: ['review_id', 'agent_id', 'agent_name', 'comment'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewAddCommentToolParams,
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

        if (!params.comment.trim()) {
            return "The 'comment' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: ReviewAddCommentToolParams,
    ): ToolInvocation<ReviewAddCommentToolParams, ToolResult> {
        return new ReviewAddCommentToolInvocation(params);
    }
}
