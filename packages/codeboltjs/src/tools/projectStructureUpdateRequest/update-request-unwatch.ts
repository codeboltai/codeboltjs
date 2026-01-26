import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';

export interface UpdateRequestUnwatchParams {
    id: string;
    watcherId: string;
    workspacePath?: string;
}

class UpdateRequestUnwatchInvocation extends BaseToolInvocation<UpdateRequestUnwatchParams, ToolResult> {
    constructor(params: UpdateRequestUnwatchParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.unwatch(
                this.params.id,
                this.params.watcherId,
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
                llmContent: `Stopped watching update request: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestUnwatchTool extends BaseDeclarativeTool<UpdateRequestUnwatchParams, ToolResult> {
    constructor() {
        super(
            'update_request_unwatch',
            'Unwatch Update Request',
            'Stop watching an update request',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Update request ID' },
                    watcherId: { type: 'string', description: 'Watcher ID to remove' },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['id', 'watcherId'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestUnwatchParams): ToolInvocation<UpdateRequestUnwatchParams, ToolResult> {
        return new UpdateRequestUnwatchInvocation(params);
    }
}
