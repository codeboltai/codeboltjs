import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';
import type { UpdateRequestFilters } from '../../types/projectStructureUpdateRequest';

export interface UpdateRequestListParams {
    filters?: UpdateRequestFilters;
    workspacePath?: string;
}

class UpdateRequestListInvocation extends BaseToolInvocation<UpdateRequestListParams, ToolResult> {
    constructor(params: UpdateRequestListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await projectStructureUpdateRequest.list(this.params.filters, this.params.workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            const count = response.data?.length || 0;
            return {
                llmContent: `Found ${count} update request(s)`,
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

export class UpdateRequestListTool extends BaseDeclarativeTool<UpdateRequestListParams, ToolResult> {
    constructor() {
        super(
            'update_request_list',
            'List Update Requests',
            'List update requests with optional filters',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    filters: {
                        type: 'object',
                        description: 'Optional filters',
                        properties: {
                            status: { type: 'array', items: { type: 'string' }, description: 'Filter by status' },
                            author: { type: 'string', description: 'Filter by author' },
                            search: { type: 'string', description: 'Search text' },
                        },
                    },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
            }
        );
    }

    protected override createInvocation(params: UpdateRequestListParams): ToolInvocation<UpdateRequestListParams, ToolResult> {
        return new UpdateRequestListInvocation(params);
    }
}
