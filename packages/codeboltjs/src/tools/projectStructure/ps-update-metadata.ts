/**
 * Project Structure Update Metadata Tool - Updates workspace metadata
 * Wraps the SDK's projectStructure.updateMetadata() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateMetadata tool
 */
export interface UpdateMetadataToolParams {
    /** Updates to apply to the metadata */
    updates: Record<string, any>;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateMetadataToolInvocation extends BaseToolInvocation<
    UpdateMetadataToolParams,
    ToolResult
> {
    constructor(params: UpdateMetadataToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.updateMetadata(
                this.params.updates,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully updated project metadata',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating project metadata: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool to update workspace metadata
 */
export class UpdateMetadataTool extends BaseDeclarativeTool<
    UpdateMetadataToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_metadata';

    constructor() {
        super(
            UpdateMetadataTool.Name,
            'UpdateMetadata',
            'Updates workspace metadata such as name, description, and version.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    updates: {
                        type: 'object',
                        description: 'Key-value pairs of metadata fields to update',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['updates'],
            },
        );
    }

    protected createInvocation(
        params: UpdateMetadataToolParams,
    ): ToolInvocation<UpdateMetadataToolParams, ToolResult> {
        return new UpdateMetadataToolInvocation(params);
    }
}
