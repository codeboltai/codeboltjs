import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';

export interface UpdateRequestSubmitParams {
    id: string;
    workspacePath?: string;
}

class UpdateRequestSubmitInvocation extends BaseToolInvocation<UpdateRequestSubmitParams, ToolResult> {
    constructor(params: UpdateRequestSubmitParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.submit(this.params.id, this.params.workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Update request submitted for review: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestSubmitTool extends BaseDeclarativeTool<UpdateRequestSubmitParams, ToolResult> {
    constructor() {
        super(
            'update_request_submit',
            'Submit Update Request',
            'Submit an update request for review',
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

    protected override createInvocation(params: UpdateRequestSubmitParams): ToolInvocation<UpdateRequestSubmitParams, ToolResult> {
        return new UpdateRequestSubmitInvocation(params);
    }
}
