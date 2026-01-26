/**
 * Todo List Incomplete Tool - Retrieves all incomplete todo items
 * Wraps the SDK's cbtodo.getAllIncompleteTodos() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbtodo from '../../modules/todo';

/**
 * Parameters for the TodoListIncomplete tool
 */
export interface TodoListIncompleteToolParams {
    // No parameters required
}

class TodoListIncompleteToolInvocation extends BaseToolInvocation<
    TodoListIncompleteToolParams,
    ToolResult
> {
    constructor(params: TodoListIncompleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbtodo.getAllIncompleteTodos();

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error getting incomplete todos: ${errorMsg}`,
                    returnDisplay: `Error getting incomplete todos: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const todoCount = response.todos ? response.todos.length : 0;

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Retrieved ${todoCount} incomplete todo(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting incomplete todos: ${errorMessage}`,
                returnDisplay: `Error getting incomplete todos: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TodoListIncomplete tool logic
 */
export class TodoListIncompleteTool extends BaseDeclarativeTool<
    TodoListIncompleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'todo_list_incomplete';

    constructor() {
        super(
            TodoListIncompleteTool.Name,
            'TodoListIncomplete',
            `Retrieves all incomplete todo items. This returns todos that are not yet marked as completed or cancelled.`,
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: TodoListIncompleteToolParams,
    ): ToolInvocation<TodoListIncompleteToolParams, ToolResult> {
        return new TodoListIncompleteToolInvocation(params);
    }
}
