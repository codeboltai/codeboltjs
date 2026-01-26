/**
 * Feedback Reply Tool
 * 
 * Replies to a feedback response.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';
import type { IReplyParams } from '../../types/groupFeedback';

/**
 * Parameters for replying to feedback
 */
export interface FeedbackReplyParams extends IReplyParams {
    /** The feedback ID this reply belongs to */
    feedbackId: string;
}

class FeedbackReplyInvocation extends BaseToolInvocation<FeedbackReplyParams, ToolResult> {
    constructor(params: FeedbackReplyParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.reply(this.params);

            const replyResponse = response.payload?.response;

            if (!replyResponse) {
                return {
                    llmContent: 'Error: Failed to reply to feedback - no reply returned',
                    returnDisplay: 'Error: Failed to reply to feedback',
                    error: {
                        message: 'No reply returned from reply operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully replied to feedback ${this.params.feedbackId}`,
                returnDisplay: `Replied to feedback ${this.params.feedbackId}`,
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
 * Tool for replying to feedback
 */
export class FeedbackReplyTool extends BaseDeclarativeTool<FeedbackReplyParams, ToolResult> {
    constructor() {
        super(
            'feedback_reply',
            'Reply to Feedback',
            'Replies to a feedback response, creating a threaded conversation.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    feedbackId: {
                        type: 'string',
                        description: 'The feedback ID',
                    },
                    responseId: {
                        type: 'string',
                        description: 'The response ID to reply to',
                    },
                    reply: {
                        type: 'string',
                        description: 'The reply content',
                    },
                },
                required: ['feedbackId', 'responseId', 'reply'],
            }
        );
    }

    protected override createInvocation(params: FeedbackReplyParams): ToolInvocation<FeedbackReplyParams, ToolResult> {
        return new FeedbackReplyInvocation(params);
    }
}
