/**
 * Memory JSON Update Tool - Updates existing JSON data in memory storage
 * Wraps the SDK's cbmemory.json.update() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryJsonUpdate tool
 */
export interface MemoryJsonUpdateToolParams {
    /**
     * The memory ID of the entry to update
     */
    memoryId: string;

    /**
     * The new JSON object to replace the existing data
     */
    json: object;
}

class MemoryJsonUpdateToolInvocation extends BaseToolInvocation<
    MemoryJsonUpdateToolParams,
    ToolResult
> {
    constructor(params: MemoryJsonUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbmemory.json.update(this.params.memoryId, this.params.json);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error updating JSON in memory: ${errorMsg}`,
                    returnDisplay: `Error updating JSON in memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully updated JSON in memory. Memory ID: ${response.memoryId}`,
                returnDisplay: `Successfully updated JSON in memory (ID: ${response.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating JSON in memory: ${errorMessage}`,
                returnDisplay: `Error updating JSON in memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryJsonUpdate tool logic
 */
export class MemoryJsonUpdateTool extends BaseDeclarativeTool<
    MemoryJsonUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_json_update';

    constructor() {
        super(
            MemoryJsonUpdateTool.Name,
            'MemoryJsonUpdate',
            'Updates an existing JSON object in memory storage by its memory ID. The new JSON object will replace the existing data.',
            Kind.Edit,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the memory entry to update.',
                        type: 'string',
                    },
                    json: {
                        description: 'The new JSON object to replace the existing data.',
                        type: 'object',
                    },
                },
                required: ['memoryId', 'json'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryJsonUpdateToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        if (params.json === null || params.json === undefined) {
            return "The 'json' parameter must be a valid object.";
        }

        if (typeof params.json !== 'object' || Array.isArray(params.json)) {
            return "The 'json' parameter must be a JSON object, not an array or primitive.";
        }

        return null;
    }

    protected createInvocation(
        params: MemoryJsonUpdateToolParams,
    ): ToolInvocation<MemoryJsonUpdateToolParams, ToolResult> {
        return new MemoryJsonUpdateToolInvocation(params);
    }
}
