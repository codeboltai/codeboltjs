/**
 * Feedback Update Status Tool
 * 
 * Updates the status of a feedback session.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';
import type { IUpdateStatusParams } from '../../types/groupFeedback';

/**
 * Parameters for updating feedback status
 */
export interface FeedbackUpdateStatusParams extends IUpdateStatusParams {
}

class FeedbackUpdateStatusInvocation extends BaseToolInvocation<FeedbackUpdateStatusParams, ToolResult> {
    constructor(params: FeedbackUpdateStatusParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.updateStatus(this.params);

            const feedback = response.payload?.feedback;

            if (!feedback) {
                return {
                    llmContent: 'Error: Failed to update status - no feedback returned',
                    returnDisplay: 'Error: Failed to update status',
                    error: {
                        message: 'No feedback returned from update operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated status for feedback ${this.params.feedbackId} to "${this.params.status}"`,
                returnDisplay: `Updated status to "${this.params.status}"`,
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
 * Tool for updating feedback status
 */
export class FeedbackUpdateStatusTool extends BaseDeclarativeTool<FeedbackUpdateStatusParams, ToolResult> {
    constructor() {
        super(
            'feedback_update_status',
            'Update Feedback Status',
            'Updates the status of a group feedback session.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    feedbackId: {
                        type: 'string',
                        description: 'The feedback ID',
                    },
                    status: {
                        type: 'string',
                        description: 'The new status',
                    },
                },
                required: ['feedbackId', 'status'],
            }
        );
    }

    protected override createInvocation(params: FeedbackUpdateStatusParams): ToolInvocation<FeedbackUpdateStatusParams, ToolResult> {
        return new FeedbackUpdateStatusInvocation(params);
    }
}
