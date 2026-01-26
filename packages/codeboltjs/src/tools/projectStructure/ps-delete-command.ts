/**
 * Project Structure Delete Command Tool - Deletes a run command
 * Wraps the SDK's projectStructure.deleteCommand() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the DeleteCommand tool
 */
export interface DeleteCommandToolParams {
    /** ID of the package containing the command */
    packageId: string;
    /** ID of the command to delete */
    commandId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class DeleteCommandToolInvocation extends BaseToolInvocation<
    DeleteCommandToolParams,
    ToolResult
> {
    constructor(params: DeleteCommandToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.deleteCommand(
                this.params.packageId,
                this.params.commandId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully deleted command: ${this.params.commandId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting command: ${errorMessage}`,
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
 * Tool to delete a run command
 */
export class DeleteCommandTool extends BaseDeclarativeTool<
    DeleteCommandToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_delete_command';

    constructor() {
        super(
            DeleteCommandTool.Name,
            'DeleteCommand',
            'Deletes a run command from a package by its ID.',
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
                        description: 'ID of the command to delete',
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
        params: DeleteCommandToolParams,
    ): ToolInvocation<DeleteCommandToolParams, ToolResult> {
        return new DeleteCommandToolInvocation(params);
    }
}
