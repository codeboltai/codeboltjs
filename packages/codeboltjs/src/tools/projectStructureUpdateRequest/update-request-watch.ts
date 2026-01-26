import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';
import type { AddWatcherData } from '../../types/projectStructureUpdateRequest';

export interface UpdateRequestWatchParams extends AddWatcherData {
    id: string;
    workspacePath?: string;
}

class UpdateRequestWatchInvocation extends BaseToolInvocation<UpdateRequestWatchParams, ToolResult> {
    constructor(params: UpdateRequestWatchParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const { id, workspacePath, ...data } = this.params;
            const response = await projectStructureUpdateRequest.watch(id, data, workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Now watching update request: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestWatchTool extends BaseDeclarativeTool<UpdateRequestWatchParams, ToolResult> {
    constructor() {
        super(
            'update_request_watch',
            'Watch Update Request',
            'Watch an update request for updates',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Update request ID' },
                    watcherId: { type: 'string', description: 'Watcher ID (agent or user)' },
                    watcherType: { type: 'string', enum: ['user', 'agent'], description: 'Type of watcher' },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['id', 'watcherId', 'watcherType'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestWatchParams): ToolInvocation<UpdateRequestWatchParams, ToolResult> {
        return new UpdateRequestWatchInvocation(params);
    }
}
