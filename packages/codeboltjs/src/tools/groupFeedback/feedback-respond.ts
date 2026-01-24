/**
 * Feedback Respond Tool
 * 
 * Responds to a feedback session.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';
import type { IRespondParams } from '../../types/groupFeedback';

/**
 * Parameters for responding to feedback
 */
export interface FeedbackRespondParams extends IRespondParams {
}

class FeedbackRespondInvocation extends BaseToolInvocation<FeedbackRespondParams, ToolResult> {
    constructor(params: FeedbackRespondParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.respond(this.params);

            const responseData = response.payload?.response;

            if (!responseData) {
                return {
                    llmContent: 'Error: Failed to respond to feedback - no response returned',
                    returnDisplay: 'Error: Failed to respond to feedback',
                    error: {
                        message: 'No response returned from respond operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully responded to feedback ${this.params.feedbackId}`,
                returnDisplay: `Responded to feedback ${this.params.feedbackId}`,
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
 * Tool for responding to feedback
 */
export class FeedbackRespondTool extends BaseDeclarativeTool<FeedbackRespondParams, ToolResult> {
    constructor() {
        super(
            'feedback_respond',
            'Respond to Feedback',
            'Responds to a group feedback session.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    feedbackId: {
                        type: 'string',
                        description: 'The feedback ID',
                    },
                    response: {
                        type: 'string',
                        description: 'The response content',
                    },
                },
                required: ['feedbackId', 'response'],
            }
        );
    }

    protected override createInvocation(params: FeedbackRespondParams): ToolInvocation<FeedbackRespondParams, ToolResult> {
        return new FeedbackRespondInvocation(params);
    }
}
