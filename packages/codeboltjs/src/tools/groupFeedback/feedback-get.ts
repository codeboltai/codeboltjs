/**
 * Feedback Get Tool
 * 
 * Retrieves a specific feedback by ID.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';
import type { IGetFeedbackParams } from '../../types/groupFeedback';

/**
 * Parameters for getting feedback
 */
export interface FeedbackGetParams extends IGetFeedbackParams {
}

class FeedbackGetInvocation extends BaseToolInvocation<FeedbackGetParams, ToolResult> {
    constructor(params: FeedbackGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.get(this.params);

            const feedback = response.payload?.feedback;

            if (!feedback) {
                return {
                    llmContent: 'Error: Failed to get feedback - no feedback returned',
                    returnDisplay: 'Error: Failed to get feedback',
                    error: {
                        message: 'No feedback returned from get operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Retrieved feedback ${this.params.feedbackId}: ${feedback.title}`,
                returnDisplay: `Retrieved feedback ${this.params.feedbackId}`,
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
 * Tool for getting feedback
 */
export class FeedbackGetTool extends BaseDeclarativeTool<FeedbackGetParams, ToolResult> {
    constructor() {
        super(
            'feedback_get',
            'Get Feedback',
            'Retrieves a specific group feedback by ID.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    feedbackId: {
                        type: 'string',
                        description: 'The feedback ID',
                    },
                },
                required: ['feedbackId'],
            }
        );
    }

    protected override createInvocation(params: FeedbackGetParams): ToolInvocation<FeedbackGetParams, ToolResult> {
        return new FeedbackGetInvocation(params);
    }
}
