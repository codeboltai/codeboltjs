/**
 * Review List Tool - Lists all reviews
 * Wraps the SDK's reviewMergeRequestService.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequestService from '../../modules/reviewMergeRequest';
import type { ReviewMergeRequestFilters, ReviewRequestStatus, ReviewRequestType } from '../../types/reviewMergeRequest';

/**
 * Parameters for the ReviewList tool
 */
export interface ReviewListToolParams {
    /**
     * Optional array of statuses to filter by
     */
    status?: ReviewRequestStatus[];

    /**
     * Optional array of types to filter by
     */
    type?: ReviewRequestType[];

    /**
     * Optional agent ID to filter by
     */
    agent_id?: string;

    /**
     * Optional swarm ID to filter by
     */
    swarm_id?: string;

    /**
     * Optional filter for reviews created after this date (ISO string)
     */
    created_after?: string;

    /**
     * Optional filter for reviews created before this date (ISO string)
     */
    created_before?: string;

    /**
     * Optional filter for reviews updated after this date (ISO string)
     */
    updated_after?: string;

    /**
     * Optional filter for reviews updated before this date (ISO string)
     */
    updated_before?: string;

    /**
     * Optional filter for titles containing this string
     */
    title_contains?: string;

    /**
     * Optional limit on number of results
     */
    limit?: number;

    /**
     * Optional offset for pagination
     */
    offset?: number;

    /**
     * Optional field to sort by
     */
    sort_by?: 'createdAt' | 'updatedAt' | 'status';

    /**
     * Optional sort order
     */
    sort_order?: 'asc' | 'desc';
}

class ReviewListToolInvocation extends BaseToolInvocation<
    ReviewListToolParams,
    ToolResult
> {
    constructor(params: ReviewListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filters: ReviewMergeRequestFilters = {};

            if (this.params.status) filters.status = this.params.status;
            if (this.params.type) filters.type = this.params.type;
            if (this.params.agent_id) filters.agentId = this.params.agent_id;
            if (this.params.swarm_id) filters.swarmId = this.params.swarm_id;
            if (this.params.created_after) filters.createdAfter = this.params.created_after;
            if (this.params.created_before) filters.createdBefore = this.params.created_before;
            if (this.params.updated_after) filters.updatedAfter = this.params.updated_after;
            if (this.params.updated_before) filters.updatedBefore = this.params.updated_before;
            if (this.params.title_contains) filters.titleContains = this.params.title_contains;
            if (this.params.limit !== undefined) filters.limit = this.params.limit;
            if (this.params.offset !== undefined) filters.offset = this.params.offset;
            if (this.params.sort_by) filters.sortBy = this.params.sort_by;
            if (this.params.sort_order) filters.sortOrder = this.params.sort_order;

            const response = await reviewMergeRequestService.list(filters);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved ${response.requests.length} reviews (total: ${response.totalCount})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing reviews: ${errorMessage}`,
                returnDisplay: `Error listing reviews: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReviewList tool logic
 */
export class ReviewListTool extends BaseDeclarativeTool<
    ReviewListToolParams,
    ToolResult
> {
    static readonly Name: string = 'review_list';

    constructor() {
        super(
            ReviewListTool.Name,
            'ReviewList',
            `Lists merge request reviews with optional filtering. Can filter by status, type, agent, swarm, date ranges, and title. Supports pagination with limit and offset, and sorting by various fields.`,
            Kind.Read,
            {
                properties: {
                    status: {
                        description: "Optional array of statuses to filter by: 'draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'review_completed', 'merged', 'rejected', 'closed'",
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'review_completed', 'merged', 'rejected', 'closed'],
                        },
                    },
                    type: {
                        description: "Optional array of types to filter by: 'review' or 'review_merge'",
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['review', 'review_merge'],
                        },
                    },
                    agent_id: {
                        description: 'Optional agent ID to filter reviews by creator',
                        type: 'string',
                    },
                    swarm_id: {
                        description: 'Optional swarm ID to filter reviews by swarm',
                        type: 'string',
                    },
                    created_after: {
                        description: 'Optional ISO date string to filter reviews created after this date',
                        type: 'string',
                    },
                    created_before: {
                        description: 'Optional ISO date string to filter reviews created before this date',
                        type: 'string',
                    },
                    updated_after: {
                        description: 'Optional ISO date string to filter reviews updated after this date',
                        type: 'string',
                    },
                    updated_before: {
                        description: 'Optional ISO date string to filter reviews updated before this date',
                        type: 'string',
                    },
                    title_contains: {
                        description: 'Optional string to filter reviews whose title contains this text',
                        type: 'string',
                    },
                    limit: {
                        description: 'Optional maximum number of results to return',
                        type: 'number',
                    },
                    offset: {
                        description: 'Optional number of results to skip for pagination',
                        type: 'number',
                    },
                    sort_by: {
                        description: "Optional field to sort results by: 'createdAt', 'updatedAt', or 'status'",
                        type: 'string',
                        enum: ['createdAt', 'updatedAt', 'status'],
                    },
                    sort_order: {
                        description: "Optional sort order: 'asc' or 'desc'",
                        type: 'string',
                        enum: ['asc', 'desc'],
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReviewListToolParams,
    ): string | null {
        if (params.limit !== undefined && params.limit < 0) {
            return 'Limit must be a non-negative number';
        }

        if (params.offset !== undefined && params.offset < 0) {
            return 'Offset must be a non-negative number';
        }

        return null;
    }

    protected createInvocation(
        params: ReviewListToolParams,
    ): ToolInvocation<ReviewListToolParams, ToolResult> {
        return new ReviewListToolInvocation(params);
    }
}
