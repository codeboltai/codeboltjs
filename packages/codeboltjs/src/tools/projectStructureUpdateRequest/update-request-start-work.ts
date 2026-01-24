import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';

export interface UpdateRequestStartWorkParams {
    id: string;
    workspacePath?: string;
}

class UpdateRequestStartWorkInvocation extends BaseToolInvocation<UpdateRequestStartWorkParams, ToolResult> {
    constructor(params: UpdateRequestStartWorkParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.startWork(this.params.id, this.params.workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Started work on update request: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestStartWorkTool extends BaseDeclarativeTool<UpdateRequestStartWorkParams, ToolResult> {
    constructor() {
        super(
            'update_request_start_work',
            'Start Work on Update Request',
            'Start working on an update request',
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

    protected override createInvocation(params: UpdateRequestStartWorkParams): ToolInvocation<UpdateRequestStartWorkParams, ToolResult> {
        return new UpdateRequestStartWorkInvocation(params);
    }
}
