/**
 * Project Structure Update Deployment Tool - Updates a deployment config
 * Wraps the SDK's projectStructure.updateDeployment() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateDeployment tool
 */
export interface UpdateDeploymentToolParams {
    /** ID of the package containing the deployment */
    packageId: string;
    /** ID of the deployment config to update */
    configId: string;
    /** Optional new name */
    name?: string;
    /** Optional new type */
    type?: 'docker' | 'kubernetes' | 'serverless' | 'static' | 'custom';
    /** Optional new description */
    description?: string;
    /** Optional new configuration object */
    config?: Record<string, any>;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateDeploymentToolInvocation extends BaseToolInvocation<
    UpdateDeploymentToolParams,
    ToolResult
> {
    constructor(params: UpdateDeploymentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, configId, workspacePath, ...updates } = this.params;
            const response = await projectStructureService.updateDeployment(
                packageId,
                configId,
                updates,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated deployment: ${configId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating deployment: ${errorMessage}`,
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
 * Tool to update a deployment config
 */
export class UpdateDeploymentTool extends BaseDeclarativeTool<
    UpdateDeploymentToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_deployment';

    constructor() {
        super(
            UpdateDeploymentTool.Name,
            'UpdateDeployment',
            'Updates an existing deployment configuration with new name, type, or config.',
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
                        description: 'ID of the deployment config to update',
                    },
                    name: {
                        type: 'string',
                        description: 'New name for the deployment',
                    },
                    type: {
                        type: 'string',
                        enum: ['docker', 'kubernetes', 'serverless', 'static', 'custom'],
                        description: 'New deployment type',
                    },
                    description: {
                        type: 'string',
                        description: 'New description',
                    },
                    config: {
                        type: 'object',
                        description: 'New configuration object',
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
        params: UpdateDeploymentToolParams,
    ): ToolInvocation<UpdateDeploymentToolParams, ToolResult> {
        return new UpdateDeploymentToolInvocation(params);
    }
}
