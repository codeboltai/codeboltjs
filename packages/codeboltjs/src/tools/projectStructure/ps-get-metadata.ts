/**
 * Project Structure Get Metadata Tool - Retrieves complete project metadata
 * Wraps the SDK's projectStructure.getMetadata() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the GetMetadata tool
 */
export interface GetMetadataToolParams {
    /** Optional workspace path */
    workspacePath?: string;
}

class GetMetadataToolInvocation extends BaseToolInvocation<
    GetMetadataToolParams,
    ToolResult
> {
    constructor(params: GetMetadataToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.getMetadata(this.params.workspacePath);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved project metadata',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting project metadata: ${errorMessage}`,
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
 * Tool to get complete project structure metadata
 */
export class GetMetadataTool extends BaseDeclarativeTool<
    GetMetadataToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_get_metadata';

    constructor() {
        super(
            GetMetadataTool.Name,
            'GetMetadata',
            'Retrieves complete project structure metadata including packages, routes, dependencies, and configurations.',
            Kind.Read,
            {
                type: 'object',
                properties: {
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path to get metadata for',
                    },
                },
                required: [],
            },
        );
    }

    protected createInvocation(
        params: GetMetadataToolParams,
    ): ToolInvocation<GetMetadataToolParams, ToolResult> {
        return new GetMetadataToolInvocation(params);
    }
}
