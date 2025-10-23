/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
    ToolInvocation,
    ToolResult,
    ToolCallConfirmationDetails,
    ToolExecuteConfirmationDetails,
    ToolConfirmationOutcome,
    ToolErrorType,
} from '../types';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from '../base-tool';
import todoService from '../../services/todoService';

// Local type definition for backward compatibility
interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: any;
}
// Insprired by langchain/deepagents.
export const WRITE_TODOS_DESCRIPTION = `This tool can help you list out the current subtasks that are required to be completed for a given user request. The list of subtasks helps you keep track of the current task, organize complex queries and help ensure that you don't miss any steps. With this list, the user can also see the current progress you are making in executing a given task.

Depending on the task complexity, you should first divide a given task into subtasks and then use this tool to list out the subtasks that are required to be completed for a given user request.
Each of the subtasks should be clear and distinct. 

Use this tool for complex queries that require multiple steps. If you find that the request is actually complex after you have started executing the user task, create a todo list and use it. If execution of the user task requires multiple steps, planning and generally is higher complexity than a simple Q&A, use this tool.

DO NOT use this tool for simple tasks that can be completed in less than 2 steps. If the user query is simple and straightforward, do not use the tool. If you can respond with an answer in a single turn then this tool is not required.

## Task state definitions

- pending: Work has not begun on a given subtask.
- in_progress: Marked just prior to beginning work on a given subtask. You should only have one subtask as in_progress at a time.
- completed: Subtask was succesfully completed with no errors or issues. If the subtask required more steps to complete, update the todo list with the subtasks. All steps should be identified as completed only when they are completed.
- cancelled: As you update the todo list, some tasks are not required anymore due to the dynamic nature of the task. In this case, mark the subtasks as cancelled.


Purpose: Use the todo_write tool to track and manage tasks.

Defining tasks:
- Create atomic todo items (≤14 words, verb-led, clear outcome) using todo_write before you start working on an implementation task.
- Todo items should be high-level, meaningful, nontrivial tasks that would take a user at least 5 minutes to perform. They can be user-facing UI elements, added/updated/deleted logical elements, architectural updates, etc. Changes across multiple files can be contained in one task.
- Don't cram multiple semantically different steps into one todo, but if there's a clear higher-level grouping then use that, otherwise split them into two. Prefer fewer, larger todo items.
- Todo items should NOT include operational actions done in service of higher-level tasks.
- If the user asks you to plan but not implement, don't create a todo list until it's actually time to implement.
- If the user asks you to implement, do not output a separate text-based High-Level Plan. Just build and display the todo list.

Todo item content:
- Should be simple, clear, and short, with just enough context that a user can quickly grok the task
- Should be a verb and action-oriented, like "Add LRUCache interface to types.ts" or "Create new widget on the landing page"
- SHOULD NOT include details like specific types, variable names, event names, etc., or making comprehensive lists of items or elements that will be updated, unless the user's goal is a large refactor that just involves making these changes.
`;

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Todo {
    id?: string;
    content: string;
    status: TodoStatus;
}

export interface WriteTodosToolParams {
    /**
     * The full list of todos. This will overwrite any existing list.
     */
    todos: Todo[];
    threadId: string
}

class WriteTodosToolInvocation extends BaseToolInvocation<
    WriteTodosToolParams,
    ToolResult
> {
    constructor(params: WriteTodosToolParams) {
        super(params);
    }

    getDescription(): string {
        const count = this.params.todos?.length ?? 0;
        if (count === 0) {
            return 'Cleared todo list';
        }
        return `Set ${count} todo(s)`;
    }

    async execute(
        _signal: AbortSignal,
        _updateOutput?: (output: string) => void,
        finalMessage?: any
    ): Promise<ToolResult> {
        // Get threadId from finalMessage context
        const { threadId } = this.params

        const { todos } = this.params;

        // Clear existing todos for this thread first
        const existingTodos = todoService.getTodosByThreadId(threadId);
        for (const todo of existingTodos) {
            todoService.deleteTodo(todo.id);
        }

        // Create new todos using the todoService
        const createdTodos = [];
        for (const todo of todos) {
            const createdTodo = todoService.createTodo({
                title: todo.content,
                threadId: threadId,
                priority: 'medium',
                tags: []
            });
            if (createdTodo) {
                // Update status if it's not pending
                if (todo.status !== 'pending') {
                    const statusMap: Record<TodoStatus, any> = {
                        'pending': 'pending',
                        'in_progress': 'processing',
                        'completed': 'completed',
                        'cancelled': 'pending' // There's no cancelled status in todoService
                    };
                    todoService.updateTodoStatus(createdTodo.id, statusMap[todo.status]);
                }
                createdTodos.push(createdTodo);
            }
        }

        const todoListString = createdTodos
            .map(
                (todo, index) => `${index + 1}. [${todo.status}] ${todo.title}`,
            )
            .join('\n');

        const llmContent =
            createdTodos.length > 0
                ? `Successfully updated the todo list. The current list is now:\n${todoListString}`
                : 'Successfully cleared the todo list.';

        return {
            llmContent,
            returnDisplay: llmContent,
        };
    }
}

export class WriteTodosTool extends BaseDeclarativeTool<
    WriteTodosToolParams,
    ToolResult
> {
    static readonly Name: string = 'todo_write';

    constructor() {
        super(
            WriteTodosTool.Name,
            'Write Todos',
            WRITE_TODOS_DESCRIPTION,
            Kind.Other,
            {
                type: 'object',
                properties: {
                    todos: {
                        type: 'array',
                        description:
                            'The complete list of todo items. This will replace the existing list.',
                        items: {
                            type: 'object',
                            description: 'A single todo item.',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'The unique identifier for the todo item (optional).',
                                },
                                content: {
                                    type: 'string',
                                    description: 'The description of the task.',
                                },
                                status: {
                                    type: 'string',
                                    description: 'The current status of the task.',
                                    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
                                },
                            },
                            required: ['content', 'status'],
                        },
                    },
                },
                required: ['todos'],
            },
        );
    }

    protected validateToolParamValues(
        params: WriteTodosToolParams,
    ): string | null {
        const todos = params?.todos;
        if (!params || !Array.isArray(todos)) {
            return '`todos` parameter must be an array';
        }

        for (const todo of todos) {
            if (typeof todo !== 'object' || todo === null) {
                return 'Each todo item must be an object';
            }
            if (todo.id && (typeof todo.id !== 'string' || !todo.id.trim())) {
                return 'Todo id must be a non-empty string if provided';
            }
            if (typeof todo.content !== 'string' || !todo.content.trim()) {
                return 'Each todo must have a non-empty content string';
            }
            if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(todo.status)) {
                return 'Each todo must have a valid status (pending, in_progress, completed, or cancelled)';
            }
        }

        const inProgressCount = todos.filter(
            (todo: Todo) => todo.status === 'in_progress',
        ).length;

        if (inProgressCount > 1) {
            return 'Invalid parameters: Only one task can be "in_progress" at a time.';
        }

        return null;
    }

    protected createInvocation(
        params: WriteTodosToolParams,
    ): ToolInvocation<WriteTodosToolParams, ToolResult> {
        return new WriteTodosToolInvocation(params);
    }
}