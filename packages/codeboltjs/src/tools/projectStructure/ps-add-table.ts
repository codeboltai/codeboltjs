/**
 * Project Structure Add Table Tool - Adds a database table to a package
 * Wraps the SDK's projectStructure.addTable() method
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
 * Parameters for the AddTable tool
 */
export interface AddTableToolParams {
    /** ID of the package to add the table to */
    packageId: string;
    /** Name of the table */
    name: string;
    /** Optional description */
    description?: string;
    /** Column definitions */
    columns: DatabaseColumn[];
    /** Optional indexes */
    indexes?: string[];
    /** Optional workspace path */
    workspacePath?: string;
}

class AddTableToolInvocation extends BaseToolInvocation<
    AddTableToolParams,
    ToolResult
> {
    constructor(params: AddTableToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...table } = this.params;
            const response = await projectStructureService.addTable(
                packageId,
                table,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added table: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding table: ${errorMessage}`,
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
 * Tool to add a database table to a package
 */
export class AddTableTool extends BaseDeclarativeTool<
    AddTableToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_add_table';

    constructor() {
        super(
            AddTableTool.Name,
            'AddTable',
            'Adds a database table definition to a package with columns and optional indexes.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to add the table to',
                    },
                    name: {
                        type: 'string',
                        description: 'Name of the database table',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the table',
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
                        description: 'Column definitions for the table',
                    },
                    indexes: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Index definitions',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'name', 'columns'],
            },
        );
    }

    protected createInvocation(
        params: AddTableToolParams,
    ): ToolInvocation<AddTableToolParams, ToolResult> {
        return new AddTableToolInvocation(params);
    }
}
