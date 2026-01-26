/**
 * Project Structure Add Command Tool - Adds a run command to a package
 * Wraps the SDK's projectStructure.addCommand() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the AddCommand tool
 */
export interface AddCommandToolParams {
    /** ID of the package to add the command to */
    packageId: string;
    /** Name of the command */
    name: string;
    /** Command string to execute */
    command: string;
    /** Optional description */
    description?: string;
    /** Optional working directory */
    cwd?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class AddCommandToolInvocation extends BaseToolInvocation<
    AddCommandToolParams,
    ToolResult
> {
    constructor(params: AddCommandToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...command } = this.params;
            const response = await projectStructureService.addCommand(
                packageId,
                command,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added command: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding command: ${errorMessage}`,
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
 * Tool to add a run command to a package
 */
export class AddCommandTool extends BaseDeclarativeTool<
    AddCommandToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_add_command';

    constructor() {
        super(
            AddCommandTool.Name,
            'AddCommand',
            'Adds a run command to a package with name and command string.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to add the command to',
                    },
                    name: {
                        type: 'string',
                        description: 'Name of the command',
                    },
                    command: {
                        type: 'string',
                        description: 'Command string to execute',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the command',
                    },
                    cwd: {
                        type: 'string',
                        description: 'Working directory for the command',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'name', 'command'],
            },
        );
    }

    protected createInvocation(
        params: AddCommandToolParams,
    ): ToolInvocation<AddCommandToolParams, ToolResult> {
        return new AddCommandToolInvocation(params);
    }
}
