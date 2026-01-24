/**
 * Feedback List Tool - Lists all feedback requests
 * Wraps the SDK's cbgroupFeedback.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';

/**
 * Parameters for the FeedbackList tool
 */
export interface FeedbackListToolParams {
    /**
     * Optional status filter: 'open' | 'in-progress' | 'resolved' | 'closed'
     */
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';

    /**
     * Optional participant filter
     */
    participant?: string;

    /**
     * Optional search query
     */
    search?: string;

    /**
     * Optional limit for results
     */
    limit?: number;

    /**
     * Optional offset for pagination
     */
    offset?: number;
}

class FeedbackListToolInvocation extends BaseToolInvocation<
    FeedbackListToolParams,
    ToolResult
> {
    constructor(params: FeedbackListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.list(this.params);

            const feedbackCount = response.payload?.feedbacks?.length || 0;
            const total = response.payload?.total || feedbackCount;

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Retrieved ${feedbackCount} feedback(s) of ${total} total`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing feedbacks: ${errorMessage}`,
                returnDisplay: `Error listing feedbacks: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the FeedbackList tool logic
 */
export class FeedbackListTool extends BaseDeclarativeTool<
    FeedbackListToolParams,
    ToolResult
> {
    static readonly Name: string = 'feedback_list';

    constructor() {
        super(
            FeedbackListTool.Name,
            'FeedbackList',
            `Lists all feedback requests. You can optionally filter by status, participant, search query, and paginate results using limit and offset.`,
            Kind.Read,
            {
                properties: {
                    status: {
                        description: "Optional status filter: 'open', 'in-progress', 'resolved', or 'closed'",
                        type: 'string',
                        enum: ['open', 'in-progress', 'resolved', 'closed'],
                    },
                    participant: {
                        description: 'Optional participant ID to filter by',
                        type: 'string',
                    },
                    search: {
                        description: 'Optional search query to filter feedbacks',
                        type: 'string',
                    },
                    limit: {
                        description: 'Optional limit for number of results to return',
                        type: 'number',
                    },
                    offset: {
                        description: 'Optional offset for pagination',
                        type: 'number',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: FeedbackListToolParams,
    ): string | null {
        if (params.status && !['open', 'in-progress', 'resolved', 'closed'].includes(params.status)) {
            return "The 'status' parameter must be 'open', 'in-progress', 'resolved', or 'closed'.";
        }

        if (params.limit !== undefined && params.limit <= 0) {
            return "The 'limit' parameter must be a positive number.";
        }

        if (params.offset !== undefined && params.offset < 0) {
            return "The 'offset' parameter must be a non-negative number.";
        }

        return null;
    }

    protected createInvocation(
        params: FeedbackListToolParams,
    ): ToolInvocation<FeedbackListToolParams, ToolResult> {
        return new FeedbackListToolInvocation(params);
    }
}
