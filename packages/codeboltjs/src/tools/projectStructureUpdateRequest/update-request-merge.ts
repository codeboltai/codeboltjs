import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';

export interface UpdateRequestMergeParams {
    id: string;
    workspacePath?: string;
}

class UpdateRequestMergeInvocation extends BaseToolInvocation<UpdateRequestMergeParams, ToolResult> {
    constructor(params: UpdateRequestMergeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.merge(this.params.id, this.params.workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Update request merged successfully: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestMergeTool extends BaseDeclarativeTool<UpdateRequestMergeParams, ToolResult> {
    constructor() {
        super(
            'update_request_merge',
            'Merge Update Request',
            'Merge an update request into the project structure',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Update request ID' },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['id'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestMergeParams): ToolInvocation<UpdateRequestMergeParams, ToolResult> {
        return new UpdateRequestMergeInvocation(params);
    }
}
