/**
 * Project Structure Add Dependency Tool - Adds a dependency to a package
 * Wraps the SDK's projectStructure.addDependency() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the AddDependency tool
 */
export interface AddDependencyToolParams {
    /** ID of the package to add the dependency to */
    packageId: string;
    /** Name of the dependency */
    name: string;
    /** Version of the dependency */
    version: string;
    /** Type of dependency */
    type: 'runtime' | 'dev' | 'peer' | 'optional';
    /** Optional description */
    description?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class AddDependencyToolInvocation extends BaseToolInvocation<
    AddDependencyToolParams,
    ToolResult
> {
    constructor(params: AddDependencyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...dependency } = this.params;
            const response = await projectStructureService.addDependency(
                packageId,
                dependency,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added dependency: ${this.params.name}@${this.params.version}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding dependency: ${errorMessage}`,
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
 * Tool to add a dependency to a package
 */
export class AddDependencyTool extends BaseDeclarativeTool<
    AddDependencyToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_add_dependency';

    constructor() {
        super(
            AddDependencyTool.Name,
            'AddDependency',
            'Adds a dependency to a package with name, version, and type.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to add the dependency to',
                    },
                    name: {
                        type: 'string',
                        description: 'Name of the dependency',
                    },
                    version: {
                        type: 'string',
                        description: 'Version of the dependency',
                    },
                    type: {
                        type: 'string',
                        enum: ['runtime', 'dev', 'peer', 'optional'],
                        description: 'Type of dependency',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the dependency',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'name', 'version', 'type'],
            },
        );
    }

    protected createInvocation(
        params: AddDependencyToolParams,
    ): ToolInvocation<AddDependencyToolParams, ToolResult> {
        return new AddDependencyToolInvocation(params);
    }
}
