/**
 * Project Structure Delete Table Tool - Deletes a database table
 * Wraps the SDK's projectStructure.deleteTable() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the DeleteTable tool
 */
export interface DeleteTableToolParams {
    /** ID of the package containing the table */
    packageId: string;
    /** ID of the table to delete */
    tableId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class DeleteTableToolInvocation extends BaseToolInvocation<
    DeleteTableToolParams,
    ToolResult
> {
    constructor(params: DeleteTableToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.deleteTable(
                this.params.packageId,
                this.params.tableId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully deleted table: ${this.params.tableId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting table: ${errorMessage}`,
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
 * Tool to delete a database table
 */
export class DeleteTableTool extends BaseDeclarativeTool<
    DeleteTableToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_delete_table';

    constructor() {
        super(
            DeleteTableTool.Name,
            'DeleteTable',
            'Deletes a database table from a package by its ID.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package containing the table',
                    },
                    tableId: {
                        type: 'string',
                        description: 'ID of the table to delete',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'tableId'],
            },
        );
    }

    protected createInvocation(
        params: DeleteTableToolParams,
    ): ToolInvocation<DeleteTableToolParams, ToolResult> {
        return new DeleteTableToolInvocation(params);
    }
}
