/**
 * Project Structure Update Table Tool - Updates a database table
 * Wraps the SDK's projectStructure.updateTable() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Database column definition
 */
interface DatabaseColumn {
    name: string;
    type: string;
    nullable?: boolean;
    primaryKey?: boolean;
    foreignKey?: string;
    defaultValue?: string;
}

/**
 * Parameters for the UpdateTable tool
 */
export interface UpdateTableToolParams {
    /** ID of the package containing the table */
    packageId: string;
    /** ID of the table to update */
    tableId: string;
    /** Optional new name */
    name?: string;
    /** Optional new description */
    description?: string;
    /** Optional new columns */
    columns?: DatabaseColumn[];
    /** Optional new indexes */
    indexes?: string[];
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateTableToolInvocation extends BaseToolInvocation<
    UpdateTableToolParams,
    ToolResult
> {
    constructor(params: UpdateTableToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, tableId, workspacePath, ...updates } = this.params;
            const response = await projectStructureService.updateTable(
                packageId,
                tableId,
                updates,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated table: ${tableId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating table: ${errorMessage}`,
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
 * Tool to update a database table
 */
export class UpdateTableTool extends BaseDeclarativeTool<
    UpdateTableToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_table';

    constructor() {
        super(
            UpdateTableTool.Name,
            'UpdateTable',
            'Updates an existing database table with new name, columns, or indexes.',
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
                        description: 'ID of the table to update',
                    },
                    name: {
                        type: 'string',
                        description: 'New name for the table',
                    },
                    description: {
                        type: 'string',
                        description: 'New description',
                    },
                    columns: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                type: { type: 'string' },
                                nullable: { type: 'boolean' },
                                primaryKey: { type: 'boolean' },
                                foreignKey: { type: 'string' },
                                defaultValue: { type: 'string' },
                            },
                            required: ['name', 'type'],
                        },
                        description: 'New column definitions',
                    },
                    indexes: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'New index definitions',
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
        params: UpdateTableToolParams,
    ): ToolInvocation<UpdateTableToolParams, ToolResult> {
        return new UpdateTableToolInvocation(params);
    }
}
