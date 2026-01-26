/**
 * Memory Todo Save Tool - Saves todo data to memory storage
 * Wraps the SDK's cbmemory.todo.save() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryTodoSave tool
 */
export interface MemoryTodoSaveToolParams {
    /**
     * The todo object to save to memory
     */
    todo: object;

    /**
     * Optional metadata associated with the todo
     */
    metadata?: object;
}

class MemoryTodoSaveToolInvocation extends BaseToolInvocation<
    MemoryTodoSaveToolParams,
    ToolResult
> {
    constructor(params: MemoryTodoSaveToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const metadata = this.params.metadata || {};
            const response = await cbmemory.todo.save(
                this.params.todo as any,
                metadata as Record<string, unknown>
            );

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error saving todo to memory: ${errorMsg}`,
                    returnDisplay: `Error saving todo to memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully saved todo to memory. Memory ID: ${response.memoryId}`,
                returnDisplay: `Successfully saved todo to memory (ID: ${response.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error saving todo to memory: ${errorMessage}`,
                returnDisplay: `Error saving todo to memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryTodoSave tool logic
 */
export class MemoryTodoSaveTool extends BaseDeclarativeTool<
    MemoryTodoSaveToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_todo_save';

    constructor() {
        super(
            MemoryTodoSaveTool.Name,
            'MemoryTodoSave',
            'Saves a todo item to memory storage. Returns the memory ID of the saved entry which can be used for later retrieval, updates, or deletion.',
            Kind.Edit,
            {
                properties: {
                    todo: {
                        description: 'The todo object to save to memory storage. Should contain task details like title, description, status, etc.',
                        type: 'object',
                    },
                    metadata: {
                        description: 'Optional metadata to associate with the todo item.',
                        type: 'object',
                    },
                },
                required: ['todo'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryTodoSaveToolParams,
    ): string | null {
        if (params.todo === null || params.todo === undefined) {
            return "The 'todo' parameter must be a valid object.";
        }

        if (typeof params.todo !== 'object' || Array.isArray(params.todo)) {
            return "The 'todo' parameter must be an object, not an array or primitive.";
        }

        if (params.metadata !== undefined && params.metadata !== null) {
            if (typeof params.metadata !== 'object' || Array.isArray(params.metadata)) {
                return "The 'metadata' parameter must be an object.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: MemoryTodoSaveToolParams,
    ): ToolInvocation<MemoryTodoSaveToolParams, ToolResult> {
        return new MemoryTodoSaveToolInvocation(params);
    }
}
