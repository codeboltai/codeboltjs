import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureUpdateRequest from '../../modules/projectStructureUpdateRequest';
import type { CreateUpdateRequestData } from '../../types/projectStructureUpdateRequest';

export interface UpdateRequestCreateParams extends CreateUpdateRequestData {
    workspacePath?: string;
}

class UpdateRequestCreateInvocation extends BaseToolInvocation<UpdateRequestCreateParams, ToolResult> {
    constructor(params: UpdateRequestCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const { workspacePath, ...data } = this.params;
            const response = await projectStructureUpdateRequest.create(data, workspacePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message}`,
                    returnDisplay: `Error: ${response.error || response.message}`,
                    error: { message: response.error || response.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Update request created successfully: ${response.data?.title || 'Untitled'}`,
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

export class UpdateRequestCreateTool extends BaseDeclarativeTool<UpdateRequestCreateParams, ToolResult> {
    constructor() {
        super(
            'update_request_create',
            'Create Update Request',
            'Create a new project structure update request',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Short title describing the change' },
                    description: { type: 'string', description: 'Detailed description of what and why' },
                    author: { type: 'string', description: 'Who created the request' },
                    authorType: { type: 'string', enum: ['user', 'agent'], description: 'Type of author' },
                    changes: { 
                        type: 'array',
                        description: 'All changes to be applied',
                        items: { type: 'object' }
                    },
                    workspacePath: { type: 'string', description: 'Optional workspace path' },
                },
                required: ['title', 'author', 'authorType', 'changes'],
            }
        );
    }

    protected override createInvocation(params: UpdateRequestCreateParams): ToolInvocation<UpdateRequestCreateParams, ToolResult> {
        return new UpdateRequestCreateInvocation(params);
    }
}
