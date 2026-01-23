/**
 * Project Structure Create Package Tool - Creates a new package
 * Wraps the SDK's projectStructure.createPackage() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the CreatePackage tool
 */
export interface CreatePackageToolParams {
    /** Name of the package */
    name: string;
    /** Path of the package */
    path: string;
    /** Optional description */
    description?: string;
    /** Optional package type */
    type?: 'frontend' | 'backend' | 'shared' | 'library' | 'service';
    /** Optional workspace path */
    workspacePath?: string;
}

class CreatePackageToolInvocation extends BaseToolInvocation<
    CreatePackageToolParams,
    ToolResult
> {
    constructor(params: CreatePackageToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { workspacePath, ...packageData } = this.params;
            const response = await projectStructureService.createPackage(
                packageData,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully created package: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating package: ${errorMessage}`,
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
 * Tool to create a new package
 */
export class CreatePackageTool extends BaseDeclarativeTool<
    CreatePackageToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_create_package';

    constructor() {
        super(
            CreatePackageTool.Name,
            'CreatePackage',
            'Creates a new package in the project structure with the specified name, path, and optional metadata.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Name of the package',
                    },
                    path: {
                        type: 'string',
                        description: 'Path of the package',
                    },
                    description: {
                        type: 'string',
                        description: 'Optional description of the package',
                    },
                    type: {
                        type: 'string',
                        enum: ['frontend', 'backend', 'shared', 'library', 'service'],
                        description: 'Type of the package',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['name', 'path'],
            },
        );
    }

    protected createInvocation(
        params: CreatePackageToolParams,
    ): ToolInvocation<CreatePackageToolParams, ToolResult> {
        return new CreatePackageToolInvocation(params);
    }
}
