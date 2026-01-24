/**
 * Memory Todo Update Tool - Updates existing todo data in memory storage
 * Wraps the SDK's cbmemory.todo.update() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryTodoUpdate tool
 */
export interface MemoryTodoUpdateToolParams {
    /**
     * The memory ID of the entry to update
     */
    memoryId: string;

    /**
     * The new todo object to replace the existing data
     */
    todo: object;
}

class MemoryTodoUpdateToolInvocation extends BaseToolInvocation<
    MemoryTodoUpdateToolParams,
    ToolResult
> {
    constructor(params: MemoryTodoUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbmemory.todo.update(
                this.params.memoryId,
                this.params.todo as any
            );

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error updating todo in memory: ${errorMsg}`,
                    returnDisplay: `Error updating todo in memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully updated todo in memory. Memory ID: ${response.memoryId}`,
                returnDisplay: `Successfully updated todo in memory (ID: ${response.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating todo in memory: ${errorMessage}`,
                returnDisplay: `Error updating todo in memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryTodoUpdate tool logic
 */
export class MemoryTodoUpdateTool extends BaseDeclarativeTool<
    MemoryTodoUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_todo_update';

    constructor() {
        super(
            MemoryTodoUpdateTool.Name,
            'MemoryTodoUpdate',
            'Updates an existing todo item in memory storage by its memory ID. The new todo object will replace the existing data.',
            Kind.Edit,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the memory entry to update.',
                        type: 'string',
                    },
                    todo: {
                        description: 'The new todo object to replace the existing data.',
                        type: 'object',
                    },
                },
                required: ['memoryId', 'todo'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryTodoUpdateToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        if (params.todo === null || params.todo === undefined) {
            return "The 'todo' parameter must be a valid object.";
        }

        if (typeof params.todo !== 'object' || Array.isArray(params.todo)) {
            return "The 'todo' parameter must be an object, not an array or primitive.";
        }

        return null;
    }

    protected createInvocation(
        params: MemoryTodoUpdateToolParams,
    ): ToolInvocation<MemoryTodoUpdateToolParams, ToolResult> {
        return new MemoryTodoUpdateToolInvocation(params);
    }
}
