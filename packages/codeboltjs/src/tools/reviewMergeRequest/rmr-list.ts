import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequest from '../../modules/reviewMergeRequest';

export interface ListReviewMergeRequestsParams {
    status?: string;
    authorId?: string;
    swarmId?: string;
    limit?: number;
    explanation?: string;
}

class ListReviewMergeRequestsInvocation extends BaseToolInvocation<ListReviewMergeRequestsParams, ToolResult> {
    constructor(params: ListReviewMergeRequestsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const filters: any = {};
            if (this.params.status) filters.status = this.params.status;
            if (this.params.authorId) filters.authorId = this.params.authorId;
            if (this.params.swarmId) filters.swarmId = this.params.swarmId;
            if (this.params.limit) filters.limit = this.params.limit;

            const response = await reviewMergeRequest.list(filters);
            const requests = response.requests || [];
            const content = `Found ${response.totalCount || requests.length} review request(s):\n${requests.map((r: any) => `- ${r.id}: ${r.title} (${r.status})`).join('\n')}`;

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

export class ListReviewMergeRequestsTool extends BaseDeclarativeTool<ListReviewMergeRequestsParams, ToolResult> {
    constructor() {
        super('reviewMergeRequest_list', 'List Review Merge Requests', 'List review merge requests', Kind.Other, {
            type: 'object',
            properties: {
                status: { type: 'string', description: 'Status filter' },
                authorId: { type: 'string', description: 'Author ID filter' },
                swarmId: { type: 'string', description: 'Swarm ID filter' },
                limit: { type: 'number', description: 'Limit' },
                explanation: { type: 'string', description: 'Explanation' },
            },
        });
    }

    protected override createInvocation(params: ListReviewMergeRequestsParams): ToolInvocation<ListReviewMergeRequestsParams, ToolResult> {
        return new ListReviewMergeRequestsInvocation(params);
    }
}
