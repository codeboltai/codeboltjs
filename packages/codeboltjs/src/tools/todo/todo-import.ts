/**
 * Todo Import Tool - Imports todos from the specified format
 * Wraps the SDK's cbtodo.importTodos() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbtodo from '../../modules/todo';

/**
 * Parameters for the TodoImport tool
 */
export interface TodoImportToolParams {
    /**
     * The import data (JSON or markdown string)
     */
    data: string;

    /**
     * The format of the import data (optional)
     */
    format?: 'json' | 'markdown';

    /**
     * How to handle existing todos (optional)
     */
    mergeStrategy?: 'replace' | 'merge';

    /**
     * Target list ID (optional)
     */
    listId?: string;
}

class TodoImportToolInvocation extends BaseToolInvocation<
    TodoImportToolParams,
    ToolResult
> {
    constructor(params: TodoImportToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbtodo.importTodos(this.params);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error importing todos: ${errorMsg}`,
                    returnDisplay: `Error importing todos: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            // ImportTodosResponse has count property
            const importedCount = response.count || response.result?.added || 0;

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully imported ${importedCount} todo(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error importing todos: ${errorMessage}`,
                returnDisplay: `Error importing todos: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TodoImport tool logic
 */
export class TodoImportTool extends BaseDeclarativeTool<
    TodoImportToolParams,
    ToolResult
> {
    static readonly Name: string = 'todo_import';

    constructor() {
        super(
            TodoImportTool.Name,
            'TodoImport',
            `Imports todos from the specified format. Supports JSON and markdown formats. You can choose to replace existing todos or merge with them.`,
            Kind.Edit,
            {
                properties: {
                    data: {
                        description: 'The import data (JSON or markdown string)',
                        type: 'string',
                    },
                    format: {
                        description: "The format of the import data: 'json' or 'markdown'",
                        type: 'string',
                        enum: ['json', 'markdown'],
                    },
                    mergeStrategy: {
                        description: "How to handle existing todos: 'replace' or 'merge'",
                        type: 'string',
                        enum: ['replace', 'merge'],
                    },
                    listId: {
                        description: 'Optional target list ID',
                        type: 'string',
                    },
                },
                required: ['data'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TodoImportToolParams,
    ): string | null {
        if (!params.data || params.data.trim() === '') {
            return "The 'data' parameter must be non-empty.";
        }

        if (params.format && !['json', 'markdown'].includes(params.format)) {
            return "The 'format' parameter must be 'json' or 'markdown'.";
        }

        if (params.mergeStrategy && !['replace', 'merge'].includes(params.mergeStrategy)) {
            return "The 'mergeStrategy' parameter must be 'replace' or 'merge'.";
        }

        return null;
    }

    protected createInvocation(
        params: TodoImportToolParams,
    ): ToolInvocation<TodoImportToolParams, ToolResult> {
        return new TodoImportToolInvocation(params);
    }
}
