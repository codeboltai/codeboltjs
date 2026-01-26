/**
 * Project Structure Update Dependency Tool - Updates a dependency
 * Wraps the SDK's projectStructure.updateDependency() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateDependency tool
 */
export interface UpdateDependencyToolParams {
    /** ID of the package containing the dependency */
    packageId: string;
    /** ID of the dependency to update */
    dependencyId: string;
    /** Optional new name */
    name?: string;
    /** Optional new version */
    version?: string;
    /** Optional new type */
    type?: 'runtime' | 'dev' | 'peer' | 'optional';
    /** Optional new description */
    description?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateDependencyToolInvocation extends BaseToolInvocation<
    UpdateDependencyToolParams,
    ToolResult
> {
    constructor(params: UpdateDependencyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, dependencyId, workspacePath, ...updates } = this.params;
            const response = await projectStructureService.updateDependency(
                packageId,
                dependencyId,
                updates,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated dependency: ${dependencyId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating dependency: ${errorMessage}`,
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
 * Tool to update a dependency
 */
export class UpdateDependencyTool extends BaseDeclarativeTool<
    UpdateDependencyToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_dependency';

    constructor() {
        super(
            UpdateDependencyTool.Name,
            'UpdateDependency',
            'Updates an existing dependency with new name, version, or type.',
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
                        description: 'ID of the dependency to update',
                    },
                    name: {
                        type: 'string',
                        description: 'New name for the dependency',
                    },
                    version: {
                        type: 'string',
                        description: 'New version',
                    },
                    type: {
                        type: 'string',
                        enum: ['runtime', 'dev', 'peer', 'optional'],
                        description: 'New dependency type',
                    },
                    description: {
                        type: 'string',
                        description: 'New description',
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
        params: UpdateDependencyToolParams,
    ): ToolInvocation<UpdateDependencyToolParams, ToolResult> {
        return new UpdateDependencyToolInvocation(params);
    }
}
