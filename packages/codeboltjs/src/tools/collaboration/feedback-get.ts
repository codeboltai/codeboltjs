/**
 * Feedback Get Tool - Gets a feedback by ID
 * Wraps the SDK's cbgroupFeedback.get() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';

/**
 * Parameters for the FeedbackGet tool
 */
export interface FeedbackGetToolParams {
    /**
     * The ID of the feedback to retrieve
     */
    id: string;

    /**
     * Optional view type: 'request' | 'full' | 'responses' | 'summary'
     */
    view?: 'request' | 'full' | 'responses' | 'summary';
}

class FeedbackGetToolInvocation extends BaseToolInvocation<
    FeedbackGetToolParams,
    ToolResult
> {
    constructor(params: FeedbackGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.get(this.params);

            const feedbackInfo = response.payload?.feedback
                ? `Retrieved feedback: ${response.payload.feedback.title}`
                : 'Feedback retrieved successfully';

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: feedbackInfo,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting feedback: ${errorMessage}`,
                returnDisplay: `Error getting feedback: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the FeedbackGet tool logic
 */
export class FeedbackGetTool extends BaseDeclarativeTool<
    FeedbackGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'feedback_get';

    constructor() {
        super(
            FeedbackGetTool.Name,
            'FeedbackGet',
            `Gets a feedback by ID. You can optionally specify a view type to retrieve different aspects of the feedback.`,
            Kind.Read,
            {
                properties: {
                    id: {
                        description: 'The ID of the feedback to retrieve',
                        type: 'string',
                    },
                    view: {
                        description: "Optional view type: 'request' (feedback only), 'full' (feedback + responses), 'responses' (responses only), or 'summary' (summary only)",
                        type: 'string',
                        enum: ['request', 'full', 'responses', 'summary'],
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: FeedbackGetToolParams,
    ): string | null {
        if (!params.id || params.id.trim() === '') {
            return "The 'id' parameter must be non-empty.";
        }

        if (params.view && !['request', 'full', 'responses', 'summary'].includes(params.view)) {
            return "The 'view' parameter must be 'request', 'full', 'responses', or 'summary'.";
        }

        return null;
    }

    protected createInvocation(
        params: FeedbackGetToolParams,
    ): ToolInvocation<FeedbackGetToolParams, ToolResult> {
        return new FeedbackGetToolInvocation(params);
    }
}
