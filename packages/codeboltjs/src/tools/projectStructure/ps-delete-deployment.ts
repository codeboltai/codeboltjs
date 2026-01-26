/**
 * Project Structure Delete Deployment Tool - Deletes a deployment config
 * Wraps the SDK's projectStructure.deleteDeployment() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the DeleteDeployment tool
 */
export interface DeleteDeploymentToolParams {
    /** ID of the package containing the deployment */
    packageId: string;
    /** ID of the deployment config to delete */
    configId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class DeleteDeploymentToolInvocation extends BaseToolInvocation<
    DeleteDeploymentToolParams,
    ToolResult
> {
    constructor(params: DeleteDeploymentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.deleteDeployment(
                this.params.packageId,
                this.params.configId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully deleted deployment: ${this.params.configId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting deployment: ${errorMessage}`,
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
 * Tool to delete a deployment config
 */
export class DeleteDeploymentTool extends BaseDeclarativeTool<
    DeleteDeploymentToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_delete_deployment';

    constructor() {
        super(
            DeleteDeploymentTool.Name,
            'DeleteDeployment',
            'Deletes a deployment configuration from a package by its ID.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package containing the deployment',
                    },
                    configId: {
                        type: 'string',
                        description: 'ID of the deployment config to delete',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'configId'],
            },
        );
    }

    protected createInvocation(
        params: DeleteDeploymentToolParams,
    ): ToolInvocation<DeleteDeploymentToolParams, ToolResult> {
        return new DeleteDeploymentToolInvocation(params);
    }
}
