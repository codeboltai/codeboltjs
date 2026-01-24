/**
 * Project Structure Update Command Tool - Updates a run command
 * Wraps the SDK's projectStructure.updateCommand() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateCommand tool
 */
export interface UpdateCommandToolParams {
    /** ID of the package containing the command */
    packageId: string;
    /** ID of the command to update */
    commandId: string;
    /** Optional new name */
    name?: string;
    /** Optional new command string */
    command?: string;
    /** Optional new description */
    description?: string;
    /** Optional new working directory */
    cwd?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateCommandToolInvocation extends BaseToolInvocation<
    UpdateCommandToolParams,
    ToolResult
> {
    constructor(params: UpdateCommandToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, commandId, workspacePath, ...updates } = this.params;
            const response = await projectStructureService.updateCommand(
                packageId,
                commandId,
                updates,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated command: ${commandId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating command: ${errorMessage}`,
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
 * Tool to update a run command
 */
export class UpdateCommandTool extends BaseDeclarativeTool<
    UpdateCommandToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_command';

    constructor() {
        super(
            UpdateCommandTool.Name,
            'UpdateCommand',
            'Updates an existing run command with new name, command string, or working directory.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package containing the command',
                    },
                    commandId: {
                        type: 'string',
                        description: 'ID of the command to update',
                    },
                    name: {
                        type: 'string',
                        description: 'New name for the command',
                    },
                    command: {
                        type: 'string',
                        description: 'New command string',
                    },
                    description: {
                        type: 'string',
                        description: 'New description',
                    },
                    cwd: {
                        type: 'string',
                        description: 'New working directory',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'commandId'],
            },
        );
    }

    protected createInvocation(
        params: UpdateCommandToolParams,
    ): ToolInvocation<UpdateCommandToolParams, ToolResult> {
        return new UpdateCommandToolInvocation(params);
    }
}
