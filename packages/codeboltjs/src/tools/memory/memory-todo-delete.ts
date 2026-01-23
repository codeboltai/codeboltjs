/**
 * Memory Todo Delete Tool - Deletes todo data from memory storage
 * Wraps the SDK's cbmemory.todo.delete() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryTodoDelete tool
 */
export interface MemoryTodoDeleteToolParams {
    /**
     * The memory ID of the entry to delete
     */
    memoryId: string;
}

class MemoryTodoDeleteToolInvocation extends BaseToolInvocation<
    MemoryTodoDeleteToolParams,
    ToolResult
> {
    constructor(params: MemoryTodoDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbmemory.todo.delete(this.params.memoryId);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error deleting todo from memory: ${errorMsg}`,
                    returnDisplay: `Error deleting todo from memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted todo from memory. Memory ID: ${this.params.memoryId}`,
                returnDisplay: `Successfully deleted todo from memory (ID: ${this.params.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting todo from memory: ${errorMessage}`,
                returnDisplay: `Error deleting todo from memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryTodoDelete tool logic
 */
export class MemoryTodoDeleteTool extends BaseDeclarativeTool<
    MemoryTodoDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_todo_delete';

    constructor() {
        super(
            MemoryTodoDeleteTool.Name,
            'MemoryTodoDelete',
            'Deletes a todo item from memory storage by its memory ID. This action is permanent and cannot be undone.',
            Kind.Delete,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the memory entry to delete.',
                        type: 'string',
                    },
                },
                required: ['memoryId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryTodoDeleteToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: MemoryTodoDeleteToolParams,
    ): ToolInvocation<MemoryTodoDeleteToolParams, ToolResult> {
        return new MemoryTodoDeleteToolInvocation(params);
    }
}
