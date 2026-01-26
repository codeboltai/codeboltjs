/**
 * Feedback Create Tool
 * 
 * Creates a new group feedback session.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';
import type { ICreateFeedbackParams } from '../../types/groupFeedback';

/**
 * Parameters for creating feedback
 */
export interface FeedbackCreateParams extends ICreateFeedbackParams {
}

class FeedbackCreateInvocation extends BaseToolInvocation<FeedbackCreateParams, ToolResult> {
    constructor(params: FeedbackCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.create(this.params);

            const feedback = response.payload?.feedback;

            if (!feedback) {
                return {
                    llmContent: 'Error: Failed to create feedback - no feedback returned',
                    returnDisplay: 'Error: Failed to create feedback',
                    error: {
                        message: 'No feedback returned from create operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully created feedback (ID: ${feedback.id})`,
                returnDisplay: `Created feedback ${feedback.id}`,
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
 * Tool for creating feedback
 */
export class FeedbackCreateTool extends BaseDeclarativeTool<FeedbackCreateParams, ToolResult> {
    constructor() {
        super(
            'feedback_create',
            'Create Feedback',
            'Creates a new group feedback session.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'The title of the feedback',
                    },
                    description: {
                        type: 'string',
                        description: 'The description of the feedback',
                    },
                    participants: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of participant IDs',
                    },
                },
                required: ['title', 'description'],
            }
        );
    }

    protected override createInvocation(params: FeedbackCreateParams): ToolInvocation<FeedbackCreateParams, ToolResult> {
        return new FeedbackCreateInvocation(params);
    }
}
