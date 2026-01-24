/**
 * Feedback Update Summary Tool
 * 
 * Updates the summary of a feedback session.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';
import type { IUpdateSummaryParams } from '../../types/groupFeedback';

/**
 * Parameters for updating feedback summary
 */
export interface FeedbackUpdateSummaryParams extends IUpdateSummaryParams {
}

class FeedbackUpdateSummaryInvocation extends BaseToolInvocation<FeedbackUpdateSummaryParams, ToolResult> {
    constructor(params: FeedbackUpdateSummaryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.updateSummary(this.params);

            const feedback = response.payload?.feedback;

            if (!feedback) {
                return {
                    llmContent: 'Error: Failed to update summary - no feedback returned',
                    returnDisplay: 'Error: Failed to update summary',
                    error: {
                        message: 'No feedback returned from update operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated summary for feedback ${this.params.feedbackId}`,
                returnDisplay: `Updated summary for feedback ${this.params.feedbackId}`,
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
 * Tool for updating feedback summary
 */
export class FeedbackUpdateSummaryTool extends BaseDeclarativeTool<FeedbackUpdateSummaryParams, ToolResult> {
    constructor() {
        super(
            'feedback_update_summary',
            'Update Feedback Summary',
            'Updates the summary of a group feedback session.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    feedbackId: {
                        type: 'string',
                        description: 'The feedback ID',
                    },
                    summary: {
                        type: 'string',
                        description: 'The new summary',
                    },
                },
                required: ['feedbackId', 'summary'],
            }
        );
    }

    protected override createInvocation(params: FeedbackUpdateSummaryParams): ToolInvocation<FeedbackUpdateSummaryParams, ToolResult> {
        return new FeedbackUpdateSummaryInvocation(params);
    }
}
