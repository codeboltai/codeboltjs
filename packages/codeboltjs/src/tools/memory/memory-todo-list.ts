/**
 * Memory Todo List Tool - Lists todo data from memory storage
 * Wraps the SDK's cbmemory.todo.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryTodoList tool
 */
export interface MemoryTodoListToolParams {
    /**
     * Optional filters to apply when listing todo entries
     */
    filters?: object;
}

class MemoryTodoListToolInvocation extends BaseToolInvocation<
    MemoryTodoListToolParams,
    ToolResult
> {
    constructor(params: MemoryTodoListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filters = this.params.filters || {};
            const response = await cbmemory.todo.list(filters as Record<string, unknown>);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing todos from memory: ${errorMsg}`,
                    returnDisplay: `Error listing todos from memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const items = response.items || [];
            const itemCount = items.length;

            return {
                llmContent: `Found ${itemCount} todo entries in memory.\n\n${JSON.stringify(items, null, 2)}`,
                returnDisplay: `Successfully listed ${itemCount} todo entries from memory`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing todos from memory: ${errorMessage}`,
                returnDisplay: `Error listing todos from memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryTodoList tool logic
 */
export class MemoryTodoListTool extends BaseDeclarativeTool<
    MemoryTodoListToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_todo_list';

    constructor() {
        super(
            MemoryTodoListTool.Name,
            'MemoryTodoList',
            'Lists todo items from memory storage. Optionally accepts filters to narrow down the results.',
            Kind.Read,
            {
                properties: {
                    filters: {
                        description: 'Optional filters to apply when listing todo entries. The structure depends on the memory storage implementation.',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryTodoListToolParams,
    ): string | null {
        if (params.filters !== undefined && params.filters !== null) {
            if (typeof params.filters !== 'object' || Array.isArray(params.filters)) {
                return "The 'filters' parameter must be a JSON object.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: MemoryTodoListToolParams,
    ): ToolInvocation<MemoryTodoListToolParams, ToolResult> {
        return new MemoryTodoListToolInvocation(params);
    }
}
