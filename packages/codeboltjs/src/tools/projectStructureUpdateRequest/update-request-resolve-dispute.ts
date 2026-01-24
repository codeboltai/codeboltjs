import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';

export interface UpdateRequestResolveDisputeParams {
    id: string;
    disputeId: string;
    resolutionSummary?: string;
    workspacePath?: string;
}

class UpdateRequestResolveDisputeInvocation extends BaseToolInvocation<UpdateRequestResolveDisputeParams, ToolResult> {
    constructor(params: UpdateRequestResolveDisputeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.resolveDispute(
                this.params.id,
                this.params.disputeId,
                this.params.resolutionSummary,
                this.params.workspacePath
            );
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Dispute resolved for update request: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestResolveDisputeTool extends BaseDeclarativeTool<UpdateRequestResolveDisputeParams, ToolResult> {
    constructor() {
        super(
            'update_request_resolve_dispute',
            'Resolve Dispute',
            'Resolve a dispute on an update request',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Update request ID' },
                    disputeId: { type: 'string', description: 'Dispute ID' },
                    resolutionSummary: { type: 'string', description: 'Optional resolution summary' },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['id', 'disputeId'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestResolveDisputeParams): ToolInvocation<UpdateRequestResolveDisputeParams, ToolResult> {
        return new UpdateRequestResolveDisputeInvocation(params);
    }
}
