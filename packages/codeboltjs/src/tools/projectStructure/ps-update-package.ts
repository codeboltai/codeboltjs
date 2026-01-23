/**
 * Project Structure Update Package Tool - Updates an existing package
 * Wraps the SDK's projectStructure.updatePackage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdatePackage tool
 */
export interface UpdatePackageToolParams {
    /** ID of the package to update */
    packageId: string;
    /** Optional new name */
    name?: string;
    /** Optional new description */
    description?: string;
    /** Optional new type */
    type?: 'frontend' | 'backend' | 'shared' | 'library' | 'service';
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdatePackageToolInvocation extends BaseToolInvocation<
    UpdatePackageToolParams,
    ToolResult
> {
    constructor(params: UpdatePackageToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...updates } = this.params;
            const response = await projectStructureService.updatePackage(
                packageId,
                updates,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated package: ${packageId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating package: ${errorMessage}`,
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
 * Tool to update an existing package
 */
export class UpdatePackageTool extends BaseDeclarativeTool<
    UpdatePackageToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_package';

    constructor() {
        super(
            UpdatePackageTool.Name,
            'UpdatePackage',
            'Updates an existing package with new name, description, or type.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to update',
                    },
                    name: {
                        type: 'string',
                        description: 'New name for the package',
                    },
                    description: {
                        type: 'string',
                        description: 'New description for the package',
                    },
                    type: {
                        type: 'string',
                        enum: ['frontend', 'backend', 'shared', 'library', 'service'],
                        description: 'New type for the package',
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
        params: UpdatePackageToolParams,
    ): ToolInvocation<UpdatePackageToolParams, ToolResult> {
        return new UpdatePackageToolInvocation(params);
    }
}
