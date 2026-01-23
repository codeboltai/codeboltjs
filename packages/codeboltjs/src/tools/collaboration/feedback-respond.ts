/**
 * Feedback Respond Tool - Adds a response to a feedback request
 * Wraps the SDK's cbgroupFeedback.respond() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';

/**
 * Parameters for the FeedbackRespond tool
 */
export interface FeedbackRespondToolParams {
    /**
     * The ID of the feedback to respond to
     */
    feedbackId: string;

    /**
     * The ID of the sender
     */
    senderId: string;

    /**
     * The name of the sender
     */
    senderName: string;

    /**
     * The body of the response
     */
    body: string;

    /**
     * Optional attachments
     */
    attachments?: Array<{
        type: 'image' | 'link' | 'file';
        path?: string;
        url?: string;
        name: string;
        preview?: string;
    }>;

    /**
     * Optional parent response ID for nested replies
     */
    parentId?: string;
}

class FeedbackRespondToolInvocation extends BaseToolInvocation<
    FeedbackRespondToolParams,
    ToolResult
> {
    constructor(params: FeedbackRespondToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.respond(this.params);

            const responseInfo = response.payload?.response
                ? `Response added with ID: ${response.payload.response.id}`
                : 'Response added successfully';

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: responseInfo,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding response to feedback: ${errorMessage}`,
                returnDisplay: `Error adding response to feedback: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the FeedbackRespond tool logic
 */
export class FeedbackRespondTool extends BaseDeclarativeTool<
    FeedbackRespondToolParams,
    ToolResult
> {
    static readonly Name: string = 'feedback_respond';

    constructor() {
        super(
            FeedbackRespondTool.Name,
            'FeedbackRespond',
            `Adds a response to a feedback request. You can specify the feedback ID, sender information, response body, optional attachments, and optionally a parent response ID for nested replies.`,
            Kind.Edit,
            {
                properties: {
                    feedbackId: {
                        description: 'The ID of the feedback to respond to',
                        type: 'string',
                    },
                    senderId: {
                        description: 'The ID of the sender',
                        type: 'string',
                    },
                    senderName: {
                        description: 'The name of the sender',
                        type: 'string',
                    },
                    body: {
                        description: 'The body of the response',
                        type: 'string',
                    },
                    attachments: {
                        description: 'Optional attachments for the response',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['image', 'link', 'file'],
                                },
                                path: { type: 'string' },
                                url: { type: 'string' },
                                name: { type: 'string' },
                                preview: { type: 'string' },
                            },
                            required: ['type', 'name'],
                        },
                    },
                    parentId: {
                        description: 'Optional parent response ID for nested replies',
                        type: 'string',
                    },
                },
                required: ['feedbackId', 'senderId', 'senderName', 'body'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: FeedbackRespondToolParams,
    ): string | null {
        if (!params.feedbackId || params.feedbackId.trim() === '') {
            return "The 'feedbackId' parameter must be non-empty.";
        }

        if (!params.senderId || params.senderId.trim() === '') {
            return "The 'senderId' parameter must be non-empty.";
        }

        if (!params.senderName || params.senderName.trim() === '') {
            return "The 'senderName' parameter must be non-empty.";
        }

        if (!params.body || params.body.trim() === '') {
            return "The 'body' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: FeedbackRespondToolParams,
    ): ToolInvocation<FeedbackRespondToolParams, ToolResult> {
        return new FeedbackRespondToolInvocation(params);
    }
}
