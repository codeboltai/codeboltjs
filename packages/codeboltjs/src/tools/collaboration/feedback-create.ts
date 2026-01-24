/**
 * Feedback Create Tool - Creates a new feedback request
 * Wraps the SDK's cbgroupFeedback.create() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';

/**
 * Parameters for the FeedbackCreate tool
 */
export interface FeedbackCreateToolParams {
    /**
     * The title of the feedback request
     */
    title: string;

    /**
     * The content of the feedback request
     */
    content: string;

    /**
     * The type of content: 'text' | 'image' | 'link' | 'file-reference'
     */
    contentType: 'text' | 'image' | 'link' | 'file-reference';

    /**
     * The ID of the creator
     */
    creatorId: string;

    /**
     * The name of the creator
     */
    creatorName: string;

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
     * Optional list of participant IDs
     */
    participants?: string[];

    /**
     * Optional initial status: 'open' | 'in-progress' | 'resolved' | 'closed'
     */
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';

    /**
     * Optional summary
     */
    summary?: string;
}

class FeedbackCreateToolInvocation extends BaseToolInvocation<
    FeedbackCreateToolParams,
    ToolResult
> {
    constructor(params: FeedbackCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.create(this.params);

            const feedbackInfo = response.payload?.feedback
                ? `Feedback created with ID: ${response.payload.feedback.id}`
                : 'Feedback created successfully';

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: feedbackInfo,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating feedback: ${errorMessage}`,
                returnDisplay: `Error creating feedback: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the FeedbackCreate tool logic
 */
export class FeedbackCreateTool extends BaseDeclarativeTool<
    FeedbackCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'feedback_create';

    constructor() {
        super(
            FeedbackCreateTool.Name,
            'FeedbackCreate',
            `Creates a new feedback request. You can specify a title, content, content type, creator information, and optional attachments, participants, status, and summary.`,
            Kind.Edit,
            {
                properties: {
                    title: {
                        description: 'The title of the feedback request',
                        type: 'string',
                    },
                    content: {
                        description: 'The content of the feedback request',
                        type: 'string',
                    },
                    contentType: {
                        description: "The type of content: 'text', 'image', 'link', or 'file-reference'",
                        type: 'string',
                        enum: ['text', 'image', 'link', 'file-reference'],
                    },
                    creatorId: {
                        description: 'The ID of the creator',
                        type: 'string',
                    },
                    creatorName: {
                        description: 'The name of the creator',
                        type: 'string',
                    },
                    attachments: {
                        description: 'Optional attachments for the feedback',
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
                    participants: {
                        description: 'Optional list of participant IDs',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    status: {
                        description: "Optional initial status: 'open', 'in-progress', 'resolved', or 'closed'",
                        type: 'string',
                        enum: ['open', 'in-progress', 'resolved', 'closed'],
                    },
                    summary: {
                        description: 'Optional summary of the feedback',
                        type: 'string',
                    },
                },
                required: ['title', 'content', 'contentType', 'creatorId', 'creatorName'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: FeedbackCreateToolParams,
    ): string | null {
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be non-empty.";
        }

        if (!params.content || params.content.trim() === '') {
            return "The 'content' parameter must be non-empty.";
        }

        if (!['text', 'image', 'link', 'file-reference'].includes(params.contentType)) {
            return "The 'contentType' parameter must be 'text', 'image', 'link', or 'file-reference'.";
        }

        if (!params.creatorId || params.creatorId.trim() === '') {
            return "The 'creatorId' parameter must be non-empty.";
        }

        if (!params.creatorName || params.creatorName.trim() === '') {
            return "The 'creatorName' parameter must be non-empty.";
        }

        if (params.status && !['open', 'in-progress', 'resolved', 'closed'].includes(params.status)) {
            return "The 'status' parameter must be 'open', 'in-progress', 'resolved', or 'closed'.";
        }

        return null;
    }

    protected createInvocation(
        params: FeedbackCreateToolParams,
    ): ToolInvocation<FeedbackCreateToolParams, ToolResult> {
        return new FeedbackCreateToolInvocation(params);
    }
}
