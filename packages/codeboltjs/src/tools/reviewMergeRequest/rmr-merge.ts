import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequest from '../../modules/reviewMergeRequest';

export interface MergeReviewMergeRequestParams {
    id: string;
    mergedBy: string;
    explanation?: string;
}

class MergeReviewMergeRequestInvocation extends BaseToolInvocation<MergeReviewMergeRequestParams, ToolResult> {
    constructor(params: MergeReviewMergeRequestParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await reviewMergeRequest.merge(this.params.id, this.params.mergedBy);

            if (!response.result) {
                return {
                    llmContent: `Error: Failed to merge`,
                    returnDisplay: `Error: Failed to merge`,
                    error: { message: 'Failed to merge', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Review request ${this.params.id} merged successfully`;
            return { llmContent: content, returnDisplay: content };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class MergeReviewMergeRequestTool extends BaseDeclarativeTool<MergeReviewMergeRequestParams, ToolResult> {
    constructor() {
        super('reviewMergeRequest_merge', 'Merge Review Merge Request', 'Merge a review merge request', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Request ID' },
                mergedBy: { type: 'string', description: 'User merging' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['id', 'mergedBy'],
        });
    }

    protected override createInvocation(params: MergeReviewMergeRequestParams): ToolInvocation<MergeReviewMergeRequestParams, ToolResult> {
        return new MergeReviewMergeRequestInvocation(params);
    }
}
