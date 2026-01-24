/**
 * Feedback List Tool
 * 
 * Lists all feedback sessions.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbgroupFeedback from '../../modules/groupFeedback';
import type { IListFeedbacksParams } from '../../types/groupFeedback';

/**
 * Parameters for listing feedback
 */
export interface FeedbackListParams extends IListFeedbacksParams {
}

class FeedbackListInvocation extends BaseToolInvocation<FeedbackListParams, ToolResult> {
    constructor(params: FeedbackListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbgroupFeedback.list(this.params);

            const feedbacks = response.payload?.feedbacks;

            if (!feedbacks) {
                return {
                    llmContent: 'Error: Failed to list feedbacks - no feedbacks returned',
                    returnDisplay: 'Error: Failed to list feedbacks',
                    error: {
                        message: 'No feedbacks returned from list operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Found ${feedbacks.length} feedback session(s)`,
                returnDisplay: `Found ${feedbacks.length} feedback(s)`,
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
 * Tool for listing feedback
 */
export class FeedbackListTool extends BaseDeclarativeTool<FeedbackListParams, ToolResult> {
    constructor() {
        super(
            'feedback_list',
            'List Feedback',
            'Lists all group feedback sessions with optional filtering.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        description: 'Optional status filter',
                    },
                    participantId: {
                        type: 'string',
                        description: 'Optional participant ID filter',
                    },
                },
                required: [],
            }
        );
    }

    protected override createInvocation(params: FeedbackListParams): ToolInvocation<FeedbackListParams, ToolResult> {
        return new FeedbackListInvocation(params);
    }
}
