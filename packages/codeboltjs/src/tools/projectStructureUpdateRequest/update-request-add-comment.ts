import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';
import type { AddCommentData } from '../../types/projectStructureUpdateRequest';

export interface UpdateRequestAddCommentParams extends AddCommentData {
    id: string;
    disputeId: string;
    workspacePath?: string;
}

class UpdateRequestAddCommentInvocation extends BaseToolInvocation<UpdateRequestAddCommentParams, ToolResult> {
    constructor(params: UpdateRequestAddCommentParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const { id, disputeId, workspacePath, ...data } = this.params;
            const response = await projectStructureUpdateRequest.addComment(id, disputeId, data, workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Comment added to dispute on update request: ${response.data?.title || 'Untitled'}`,
                returnDisplay: JSON.stringify(response.data, null, 2),
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class UpdateRequestAddCommentTool extends BaseDeclarativeTool<UpdateRequestAddCommentParams, ToolResult> {
    constructor() {
        super(
            'update_request_add_comment',
            'Add Comment to Dispute',
            'Add a comment to a dispute on an update request',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Update request ID' },
                    disputeId: { type: 'string', description: 'Dispute ID' },
                    author: { type: 'string', description: 'Comment author' },
                    authorType: { type: 'string', enum: ['user', 'agent'], description: 'Type of author' },
                    content: { type: 'string', description: 'Comment content' },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['id', 'disputeId', 'author', 'authorType', 'content'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestAddCommentParams): ToolInvocation<UpdateRequestAddCommentParams, ToolResult> {
        return new UpdateRequestAddCommentInvocation(params);
    }
}
