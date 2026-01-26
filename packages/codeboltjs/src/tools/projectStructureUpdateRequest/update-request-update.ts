import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';
import type { UpdateUpdateRequestData } from '../../types/projectStructureUpdateRequest';

export interface UpdateRequestUpdateParams extends UpdateUpdateRequestData {
    id: string;
    workspacePath?: string;
}

class UpdateRequestUpdateInvocation extends BaseToolInvocation<UpdateRequestUpdateParams, ToolResult> {
    constructor(params: UpdateRequestUpdateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const { id, workspacePath, ...updates } = this.params;
            const response = await projectStructureUpdateRequest.update(id, updates, workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Update request updated successfully: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestUpdateTool extends BaseDeclarativeTool<UpdateRequestUpdateParams, ToolResult> {
    constructor() {
        super(
            'update_request_update',
            'Update Update Request',
            'Update an existing update request',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Update request ID' },
                    title: { type: 'string', description: 'New title' },
                    description: { type: 'string', description: 'New description' },
                    changes: { 
                        type: 'array',
                        description: 'Updated changes',
                        items: { type: 'object' }
                    },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['id'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestUpdateParams): ToolInvocation<UpdateRequestUpdateParams, ToolResult> {
        return new UpdateRequestUpdateInvocation(params);
    }
}
