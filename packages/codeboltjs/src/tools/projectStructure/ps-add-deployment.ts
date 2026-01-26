/**
 * Project Structure Add Deployment Tool - Adds a deployment config to a package
 * Wraps the SDK's projectStructure.addDeployment() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the AddDeployment tool
 */
export interface AddDeploymentToolParams {
    /** ID of the package to add the deployment to */
    packageId: string;
    /** Name of the deployment config */
    name: string;
    /** Type of deployment */
    type: 'docker' | 'kubernetes' | 'serverless' | 'static' | 'custom';
    /** Optional description */
    description?: string;
    /** Optional configuration object */
    config?: Record<string, any>;
    /** Optional workspace path */
    workspacePath?: string;
}

class AddDeploymentToolInvocation extends BaseToolInvocation<
    AddDeploymentToolParams,
    ToolResult
> {
    constructor(params: AddDeploymentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...deploymentConfig } = this.params;
            const response = await projectStructureService.addDeployment(
                packageId,
                deploymentConfig,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added deployment: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding deployment: ${errorMessage}`,
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
 * Tool to add a deployment config to a package
 */
export class AddDeploymentTool extends BaseDeclarativeTool<
    AddDeploymentToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_add_deployment';

    constructor() {
        super(
            AddDeploymentTool.Name,
            'AddDeployment',
            'Adds a deployment configuration to a package with name, type, and optional config.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to add the deployment to',
                    },
                    name: {
                        type: 'string',
                        description: 'Name of the deployment configuration',
                    },
                    type: {
                        type: 'string',
                        enum: ['docker', 'kubernetes', 'serverless', 'static', 'custom'],
                        description: 'Type of deployment',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the deployment',
                    },
                    config: {
                        type: 'object',
                        description: 'Additional configuration object',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'name', 'type'],
            },
        );
    }

    protected createInvocation(
        params: AddDeploymentToolParams,
    ): ToolInvocation<AddDeploymentToolParams, ToolResult> {
        return new AddDeploymentToolInvocation(params);
    }
}
