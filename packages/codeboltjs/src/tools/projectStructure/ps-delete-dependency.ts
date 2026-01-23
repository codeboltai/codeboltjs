/**
 * Project Structure Delete Dependency Tool - Deletes a dependency
 * Wraps the SDK's projectStructure.deleteDependency() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the DeleteDependency tool
 */
export interface DeleteDependencyToolParams {
    /** ID of the package containing the dependency */
    packageId: string;
    /** ID of the dependency to delete */
    dependencyId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class DeleteDependencyToolInvocation extends BaseToolInvocation<
    DeleteDependencyToolParams,
    ToolResult
> {
    constructor(params: DeleteDependencyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.deleteDependency(
                this.params.packageId,
                this.params.dependencyId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully deleted dependency: ${this.params.dependencyId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting dependency: ${errorMessage}`,
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
 * Tool to delete a dependency
 */
export class DeleteDependencyTool extends BaseDeclarativeTool<
    DeleteDependencyToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_delete_dependency';

    constructor() {
        super(
            DeleteDependencyTool.Name,
            'DeleteDependency',
            'Deletes a dependency from a package by its ID.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package containing the dependency',
                    },
                    dependencyId: {
                        type: 'string',
                        description: 'ID of the dependency to delete',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'dependencyId'],
            },
        );
    }

    protected createInvocation(
        params: DeleteDependencyToolParams,
    ): ToolInvocation<DeleteDependencyToolParams, ToolResult> {
        return new DeleteDependencyToolInvocation(params);
    }
}
