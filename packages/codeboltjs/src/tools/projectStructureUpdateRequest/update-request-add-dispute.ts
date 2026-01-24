import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';
import type { CreateDisputeData } from '../../types/projectStructureUpdateRequest';

export interface UpdateRequestAddDisputeParams extends CreateDisputeData {
    id: string;
    workspacePath?: string;
}

class UpdateRequestAddDisputeInvocation extends BaseToolInvocation<UpdateRequestAddDisputeParams, ToolResult> {
    constructor(params: UpdateRequestAddDisputeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const { id, workspacePath, ...data } = this.params;
            const response = await projectStructureUpdateRequest.addDispute(id, data, workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Dispute added to update request: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestAddDisputeTool extends BaseDeclarativeTool<UpdateRequestAddDisputeParams, ToolResult> {
    constructor() {
        super(
            'update_request_add_dispute',
            'Add Dispute to Update Request',
            'Add a dispute to an update request',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Update request ID' },
                    raisedBy: { type: 'string', description: 'Who raised the dispute' },
                    raisedByType: { type: 'string', enum: ['user', 'agent'], description: 'Type of actor' },
                    reason: { type: 'string', description: 'Reason for the dispute' },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['id', 'raisedBy', 'raisedByType', 'reason'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestAddDisputeParams): ToolInvocation<UpdateRequestAddDisputeParams, ToolResult> {
        return new UpdateRequestAddDisputeInvocation(params);
    }
}
