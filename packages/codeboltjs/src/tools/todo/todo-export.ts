/**
 * Todo Export Tool - Exports todos in the specified format
 * Wraps the SDK's cbtodo.exportTodos() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbtodo from '../../modules/todo';

/**
 * Parameters for the TodoExport tool
 */
export interface TodoExportToolParams {
    /**
     * The export format (optional)
     */
    format?: 'json' | 'markdown';

    /**
     * List ID to filter (optional)
     */
    listId?: string;

    /**
     * Status filter (optional)
     */
    status?: string[];
}

class TodoExportToolInvocation extends BaseToolInvocation<
    TodoExportToolParams,
    ToolResult
> {
    constructor(params: TodoExportToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbtodo.exportTodos(this.params);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error exporting todos: ${errorMsg}`,
                    returnDisplay: `Error exporting todos: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const format = this.params.format || 'json';

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Todos exported successfully in ${format} format`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error exporting todos: ${errorMessage}`,
                returnDisplay: `Error exporting todos: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TodoExport tool logic
 */
export class TodoExportTool extends BaseDeclarativeTool<
    TodoExportToolParams,
    ToolResult
> {
    static readonly Name: string = 'todo_export';

    constructor() {
        super(
            TodoExportTool.Name,
            'TodoExport',
            `Exports todos in the specified format. Supports JSON and markdown formats. You can filter by list ID and status.`,
            Kind.Read,
            {
                properties: {
                    format: {
                        description: "The export format: 'json' or 'markdown'",
                        type: 'string',
                        enum: ['json', 'markdown'],
                    },
                    listId: {
                        description: 'Optional list ID to filter todos',
                        type: 'string',
                    },
                    status: {
                        description: 'Optional status filter (array of status values)',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TodoExportToolParams,
    ): string | null {
        if (params.format && !['json', 'markdown'].includes(params.format)) {
            return "The 'format' parameter must be 'json' or 'markdown'.";
        }

        return null;
    }

    protected createInvocation(
        params: TodoExportToolParams,
    ): ToolInvocation<TodoExportToolParams, ToolResult> {
        return new TodoExportToolInvocation(params);
    }
}
