/**
 * Project Structure Update Frontend Framework Tool - Updates frontend framework for a package
 * Wraps the SDK's projectStructure.updateFrontendFramework() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateFrontendFramework tool
 */
export interface UpdateFrontendFrameworkToolParams {
    /** ID of the package to update */
    packageId: string;
    /** Name of the framework */
    name: string;
    /** Optional framework version */
    version?: string;
    /** Optional description */
    description?: string;
    /** Optional configuration object */
    config?: Record<string, any>;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateFrontendFrameworkToolInvocation extends BaseToolInvocation<
    UpdateFrontendFrameworkToolParams,
    ToolResult
> {
    constructor(params: UpdateFrontendFrameworkToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...framework } = this.params;
            const response = await projectStructureService.updateFrontendFramework(
                packageId,
                framework,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated frontend framework for package: ${packageId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating frontend framework: ${errorMessage}`,
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
 * Tool to update frontend framework for a package
 */
export class UpdateFrontendFrameworkTool extends BaseDeclarativeTool<
    UpdateFrontendFrameworkToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_frontend_framework';

    constructor() {
        super(
            UpdateFrontendFrameworkTool.Name,
            'UpdateFrontendFramework',
            'Updates the frontend framework information for a package including name, version, and config.',
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
                        description: 'Name of the framework (e.g., React, Vue, Angular)',
                    },
                    version: {
                        type: 'string',
                        description: 'Framework version',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the framework setup',
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
                required: ['packageId', 'name'],
            },
        );
    }

    protected createInvocation(
        params: UpdateFrontendFrameworkToolParams,
    ): ToolInvocation<UpdateFrontendFrameworkToolParams, ToolResult> {
        return new UpdateFrontendFrameworkToolInvocation(params);
    }
}
