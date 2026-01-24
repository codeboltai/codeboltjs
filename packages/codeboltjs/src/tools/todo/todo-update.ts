/**
 * Todo Update Tool - Updates an existing todo item
 * Wraps the SDK's cbtodo.updateTodo() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbtodo from '../../modules/todo';

/**
 * Parameters for the TodoUpdate tool
 */
export interface TodoUpdateToolParams {
    /**
     * The ID of the todo to update
     */
    id: string;

    /**
     * The new title (optional)
     */
    title?: string;

    /**
     * The new status (optional)
     */
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';

    /**
     * The new priority (optional)
     */
    priority?: 'high' | 'medium' | 'low';

    /**
     * New tags for the todo (optional)
     */
    tags?: string[];
}

class TodoUpdateToolInvocation extends BaseToolInvocation<
    TodoUpdateToolParams,
    ToolResult
> {
    constructor(params: TodoUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbtodo.updateTodo(this.params);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error updating todo: ${errorMsg}`,
                    returnDisplay: `Error updating todo: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Todo ${this.params.id} updated successfully`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating todo: ${errorMessage}`,
                returnDisplay: `Error updating todo: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TodoUpdate tool logic
 */
export class TodoUpdateTool extends BaseDeclarativeTool<
    TodoUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'todo_update';

    constructor() {
        super(
            TodoUpdateTool.Name,
            'TodoUpdate',
            `Updates an existing todo item. You can modify the title, status, priority, and tags. At least one field to update should be provided along with the todo ID.`,
            Kind.Edit,
            {
                properties: {
                    id: {
                        description: 'The ID of the todo to update',
                        type: 'string',
                    },
                    title: {
                        description: 'The new title for the todo',
                        type: 'string',
                    },
                    status: {
                        description: "The new status: 'pending', 'processing', 'completed', or 'cancelled'",
                        type: 'string',
                        enum: ['pending', 'processing', 'completed', 'cancelled'],
                    },
                    priority: {
                        description: "The new priority: 'high', 'medium', or 'low'",
                        type: 'string',
                        enum: ['high', 'medium', 'low'],
                    },
                    tags: {
                        description: 'New tags for the todo',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TodoUpdateToolParams,
    ): string | null {
        if (!params.id || params.id.trim() === '') {
            return "The 'id' parameter must be non-empty.";
        }

        if (params.status && !['pending', 'processing', 'completed', 'cancelled'].includes(params.status)) {
            return "The 'status' parameter must be 'pending', 'processing', 'completed', or 'cancelled'.";
        }

        if (params.priority && !['high', 'medium', 'low'].includes(params.priority)) {
            return "The 'priority' parameter must be 'high', 'medium', or 'low'.";
        }

        return null;
    }

    protected createInvocation(
        params: TodoUpdateToolParams,
    ): ToolInvocation<TodoUpdateToolParams, ToolResult> {
        return new TodoUpdateToolInvocation(params);
    }
}
