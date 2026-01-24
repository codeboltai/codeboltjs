/**
 * Project Structure Get Packages Tool - Retrieves all packages in the workspace
 * Wraps the SDK's projectStructure.getPackages() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the GetPackages tool
 */
export interface GetPackagesToolParams {
    /** Optional workspace path */
    workspacePath?: string;
}

class GetPackagesToolInvocation extends BaseToolInvocation<
    GetPackagesToolParams,
    ToolResult
> {
    constructor(params: GetPackagesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.getPackages(this.params.workspacePath);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved ${response.count} packages`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting packages: ${errorMessage}`,
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
 * Tool to get all packages in the workspace
 */
export class GetPackagesTool extends BaseDeclarativeTool<
    GetPackagesToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_get_packages';

    constructor() {
        super(
            GetPackagesTool.Name,
            'GetPackages',
            'Retrieves all packages in the workspace with their metadata.',
            Kind.Read,
            {
                type: 'object',
                properties: {
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path to get packages for',
                    },
                },
                required: [],
            },
        );
    }

    protected createInvocation(
        params: GetPackagesToolParams,
    ): ToolInvocation<GetPackagesToolParams, ToolResult> {
        return new GetPackagesToolInvocation(params);
    }
}
