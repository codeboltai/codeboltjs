/**
 * Project Structure Delete Package Tool - Deletes a package
 * Wraps the SDK's projectStructure.deletePackage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the DeletePackage tool
 */
export interface DeletePackageToolParams {
    /** ID of the package to delete */
    packageId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class DeletePackageToolInvocation extends BaseToolInvocation<
    DeletePackageToolParams,
    ToolResult
> {
    constructor(params: DeletePackageToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.deletePackage(
                this.params.packageId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully deleted package: ${this.params.packageId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting package: ${errorMessage}`,
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
 * Tool to delete a package
 */
export class DeletePackageTool extends BaseDeclarativeTool<
    DeletePackageToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_delete_package';

    constructor() {
        super(
            DeletePackageTool.Name,
            'DeletePackage',
            'Deletes a package from the project structure by its ID.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to delete',
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
        params: DeletePackageToolParams,
    ): ToolInvocation<DeletePackageToolParams, ToolResult> {
        return new DeletePackageToolInvocation(params);
    }
}
