import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';

export interface UpdateRequestGetParams {
    id: string;
    workspacePath?: string;
}

class UpdateRequestGetInvocation extends BaseToolInvocation<UpdateRequestGetParams, ToolResult> {
    constructor(params: UpdateRequestGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.get(this.params.id, this.params.workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Update request retrieved: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestGetTool extends BaseDeclarativeTool<UpdateRequestGetParams, ToolResult> {
    constructor() {
        super(
            'update_request_get',
            'Get Update Request',
            'Get an update request by ID',
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

    protected override createInvocation(params: UpdateRequestGetParams): ToolInvocation<UpdateRequestGetParams, ToolResult> {
        return new UpdateRequestGetInvocation(params);
    }
}
