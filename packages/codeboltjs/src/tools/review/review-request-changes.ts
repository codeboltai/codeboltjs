/**
 * Review Request Changes Tool - Requests changes on a merge request
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
 * Parameters for the ReviewRequestChanges tool
 */
export interface ReviewRequestChangesToolParams {
    /**
     * The ID of the review to request changes on
     */
    review_id: string;

    /**
     * The ID of the agent requesting changes
     */
    agent_id: string;

    /**
     * The name of the agent requesting changes
     */
    agent_name: string;

    /**
     * Comment describing the changes needed
     */
    comment: string;
}

class ReviewRequestChangesToolInvocation extends BaseToolInvocation<
    ReviewRequestChangesToolParams,
    ToolResult
> {
    constructor(params: ReviewRequestChangesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await reviewMergeRequestService.addReview(
                this.params.review_id,
                {
                    agentId: this.params.agent_id,
                    agentName: this.params.agent_name,
                    type: 'request_changes',
                    comment: this.params.comment,
                }
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully requested changes on review: ${this.params.review_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error requesting changes: ${errorMessage}`,
                returnDisplay: `Error requesting changes: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewRequestChanges tool logic
 */
export class ReviewRequestChangesTool extends BaseDeclarativeTool<
    ReviewRequestChangesToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_request_changes';

    constructor() {
        super(
            ReviewRequestChangesTool.Name,
            'ReviewRequestChanges',
            `Requests changes on a merge request review. Adds a request_changes feedback from the specified agent with a comment describing what needs to be changed. The submitter will need to address these changes before the review can be approved.`,
            Kind.Execute,
            {
                properties: {
                    review_id: {
                        description: 'The unique identifier of the review to request changes on',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent requesting changes',
                        type: 'string',
                    },
                    agent_name: {
                        description: 'The name of the agent requesting changes',
                        type: 'string',
                    },
                    comment: {
                        description: 'Detailed comment describing what changes are needed',
                        type: 'string',
                    },
                },
                required: ['review_id', 'agent_id', 'agent_name', 'comment'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewRequestChangesToolParams,
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
            return "The 'comment' parameter must be non-empty when requesting changes.";
        }

        return null;
    }

    protected createInvocation(
        params: ReviewRequestChangesToolParams,
    ): ToolInvocation<ReviewRequestChangesToolParams, ToolResult> {
        return new ReviewRequestChangesToolInvocation(params);
    }
}
