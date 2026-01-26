/**
 * Todo List Tool - Retrieves the todo list
 * Wraps the SDK's cbtodo.getTodoList() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbtodo from '../../modules/todo';

/**
 * Parameters for the TodoList tool
 */
export interface TodoListToolParams {
    /**
     * Optional filters for the todo list
     */
    filters?: object;
}

class TodoListToolInvocation extends BaseToolInvocation<
    TodoListToolParams,
    ToolResult
> {
    constructor(params: TodoListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbtodo.getTodoList(this.params.filters);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error getting todo list: ${errorMsg}`,
                    returnDisplay: `Error getting todo list: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            // GetTodoListResponse has todoList (single) or lists (array)
            const todoList = response.todoList;
            const lists = response.lists;
            const todoCount = todoList?.todos?.length || lists?.reduce((sum, list) => sum + (list.todos?.length || 0), 0) || 0;

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Retrieved ${todoCount} todo(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting todo list: ${errorMessage}`,
                returnDisplay: `Error getting todo list: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TodoList tool logic
 */
export class TodoListTool extends BaseDeclarativeTool<
    TodoListToolParams,
    ToolResult
> {
    static readonly Name: string = 'todo_list';

    constructor() {
        super(
            TodoListTool.Name,
            'TodoList',
            `Retrieves the todo list. You can optionally provide filters to narrow down the results.`,
            Kind.Read,
            {
                properties: {
                    filters: {
                        description: 'Optional filters to apply to the todo list query',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: TodoListToolParams,
    ): ToolInvocation<TodoListToolParams, ToolResult> {
        return new TodoListToolInvocation(params);
    }
}
