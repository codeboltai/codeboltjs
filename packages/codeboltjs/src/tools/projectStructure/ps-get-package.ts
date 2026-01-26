/**
 * Project Structure Get Package Tool - Retrieves a specific package by ID
 * Wraps the SDK's projectStructure.getPackage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the GetPackage tool
 */
export interface GetPackageToolParams {
    /** ID of the package to retrieve */
    packageId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class GetPackageToolInvocation extends BaseToolInvocation<
    GetPackageToolParams,
    ToolResult
> {
    constructor(params: GetPackageToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.getPackage(
                this.params.packageId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved package: ${this.params.packageId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting package: ${errorMessage}`,
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
 * Tool to get a specific package by ID
 */
export class GetPackageTool extends BaseDeclarativeTool<
    GetPackageToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_get_package';

    constructor() {
        super(
            GetPackageTool.Name,
            'GetPackage',
            'Retrieves a specific package by its ID with all its metadata.',
            Kind.Read,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to retrieve',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId'],
            },
        );
    }

    protected createInvocation(
        params: GetPackageToolParams,
    ): ToolInvocation<GetPackageToolParams, ToolResult> {
        return new GetPackageToolInvocation(params);
    }
}
