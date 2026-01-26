/**
 * Todo Add Tool - Adds a new todo item
 * Wraps the SDK's cbtodo.addTodo() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbtodo from '../../modules/todo';

/**
 * Parameters for the TodoAdd tool
 */
export interface TodoAddToolParams {
    /**
     * The title of the todo
     */
    title: string;

    /**
     * The priority of the todo (optional)
     */
    priority?: 'high' | 'medium' | 'low';

    /**
     * Tags for the todo (optional)
     */
    tags?: string[];
}

class TodoAddToolInvocation extends BaseToolInvocation<
    TodoAddToolParams,
    ToolResult
> {
    constructor(params: TodoAddToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbtodo.addTodo(this.params);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error adding todo: ${errorMsg}`,
                    returnDisplay: `Error adding todo: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const todoInfo = response.todo
                ? `Todo created with ID: ${response.todo.id}`
                : 'Todo created successfully';

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: todoInfo,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding todo: ${errorMessage}`,
                returnDisplay: `Error adding todo: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TodoAdd tool logic
 */
export class TodoAddTool extends BaseDeclarativeTool<
    TodoAddToolParams,
    ToolResult
> {
    static readonly Name: string = 'todo_add';

    constructor() {
        super(
            TodoAddTool.Name,
            'TodoAdd',
            `Adds a new todo item to the todo list. You can specify a title, priority level, and optional tags for organization.`,
            Kind.Edit,
            {
                properties: {
                    title: {
                        description: 'The title of the todo item',
                        type: 'string',
                    },
                    priority: {
                        description: "The priority of the todo: 'high', 'medium', or 'low'",
                        type: 'string',
                        enum: ['high', 'medium', 'low'],
                    },
                    tags: {
                        description: 'Tags for organizing the todo',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['title'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TodoAddToolParams,
    ): string | null {
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be non-empty.";
        }

        if (params.priority && !['high', 'medium', 'low'].includes(params.priority)) {
            return "The 'priority' parameter must be 'high', 'medium', or 'low'.";
        }

        return null;
    }

    protected createInvocation(
        params: TodoAddToolParams,
    ): ToolInvocation<TodoAddToolParams, ToolResult> {
        return new TodoAddToolInvocation(params);
    }
}
