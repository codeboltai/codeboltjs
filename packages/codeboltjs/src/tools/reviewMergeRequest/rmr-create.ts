import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import reviewMergeRequest from '../../modules/reviewMergeRequest';

export interface CreateReviewMergeRequestParams {
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
    authorId: string;
    swarmId?: string;
    explanation?: string;
}

class CreateReviewMergeRequestInvocation extends BaseToolInvocation<CreateReviewMergeRequestParams, ToolResult> {
    constructor(params: CreateReviewMergeRequestParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            // Map tool params to CreateReviewMergeRequest interface
            const response = await reviewMergeRequest.create({
                type: 'review_merge',
                title: this.params.title,
                description: this.params.description,
                initialTask: this.params.description,
                majorFilesChanged: [],
                diffPatch: '',
                agentId: this.params.authorId,
                agentName: this.params.authorId,
                swarmId: this.params.swarmId,
            });

            const req = response.data?.request || response.request;

            if (!req) {
                return {
                    llmContent: `Error: Failed to create review merge request - no request returned`,
                    returnDisplay: `Error: Failed to create`,
                    error: { message: 'Failed to create', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Review merge request created: ${req.id} - ${req.title} (${req.status})`;
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

export class CreateReviewMergeRequestTool extends BaseDeclarativeTool<CreateReviewMergeRequestParams, ToolResult> {
    constructor() {
        super('reviewMergeRequest_create', 'Create Review Merge Request', 'Create a new review merge request', Kind.Other, {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Title' },
                description: { type: 'string', description: 'Description' },
                sourceBranch: { type: 'string', description: 'Source branch' },
                targetBranch: { type: 'string', description: 'Target branch' },
                authorId: { type: 'string', description: 'Author ID' },
                swarmId: { type: 'string', description: 'Swarm ID' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['title', 'description', 'sourceBranch', 'targetBranch', 'authorId'],
        });
    }

    protected override createInvocation(params: CreateReviewMergeRequestParams): ToolInvocation<CreateReviewMergeRequestParams, ToolResult> {
        return new CreateReviewMergeRequestInvocation(params);
    }
}
