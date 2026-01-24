import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';

export interface UpdateRequestDeleteParams {
    id: string;
    workspacePath?: string;
}

class UpdateRequestDeleteInvocation extends BaseToolInvocation<UpdateRequestDeleteParams, ToolResult> {
    constructor(params: UpdateRequestDeleteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.delete(this.params.id, this.params.workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Update request deleted successfully`,
                returnDisplay: `Update request ${this.params.id} deleted`,
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

export class UpdateRequestDeleteTool extends BaseDeclarativeTool<UpdateRequestDeleteParams, ToolResult> {
    constructor() {
        super(
            'update_request_delete',
            'Delete Update Request',
            'Delete an update request',
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

    protected override createInvocation(params: UpdateRequestDeleteParams): ToolInvocation<UpdateRequestDeleteParams, ToolResult> {
        return new UpdateRequestDeleteInvocation(params);
    }
}
