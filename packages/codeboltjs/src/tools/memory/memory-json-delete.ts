/**
 * Memory JSON Delete Tool - Deletes JSON data from memory storage
 * Wraps the SDK's cbmemory.json.delete() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryJsonDelete tool
 */
export interface MemoryJsonDeleteToolParams {
    /**
     * The memory ID of the entry to delete
     */
    memoryId: string;
}

class MemoryJsonDeleteToolInvocation extends BaseToolInvocation<
    MemoryJsonDeleteToolParams,
    ToolResult
> {
    constructor(params: MemoryJsonDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbmemory.json.delete(this.params.memoryId);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error deleting JSON from memory: ${errorMsg}`,
                    returnDisplay: `Error deleting JSON from memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted JSON from memory. Memory ID: ${this.params.memoryId}`,
                returnDisplay: `Successfully deleted JSON from memory (ID: ${this.params.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting JSON from memory: ${errorMessage}`,
                returnDisplay: `Error deleting JSON from memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryJsonDelete tool logic
 */
export class MemoryJsonDeleteTool extends BaseDeclarativeTool<
    MemoryJsonDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_json_delete';

    constructor() {
        super(
            MemoryJsonDeleteTool.Name,
            'MemoryJsonDelete',
            'Deletes a JSON object from memory storage by its memory ID. This action is permanent and cannot be undone.',
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
        params: MemoryJsonDeleteToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: MemoryJsonDeleteToolParams,
    ): ToolInvocation<MemoryJsonDeleteToolParams, ToolResult> {
        return new MemoryJsonDeleteToolInvocation(params);
    }
}
