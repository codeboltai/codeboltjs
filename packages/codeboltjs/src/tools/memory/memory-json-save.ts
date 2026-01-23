/**
 * Memory JSON Save Tool - Saves JSON data to memory storage
 * Wraps the SDK's cbmemory.json.save() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryJsonSave tool
 */
export interface MemoryJsonSaveToolParams {
    /**
     * The JSON object to save to memory
     */
    json: object;
}

class MemoryJsonSaveToolInvocation extends BaseToolInvocation<
    MemoryJsonSaveToolParams,
    ToolResult
> {
    constructor(params: MemoryJsonSaveToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbmemory.json.save(this.params.json);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error saving JSON to memory: ${errorMsg}`,
                    returnDisplay: `Error saving JSON to memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully saved JSON to memory. Memory ID: ${response.memoryId}`,
                returnDisplay: `Successfully saved JSON to memory (ID: ${response.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error saving JSON to memory: ${errorMessage}`,
                returnDisplay: `Error saving JSON to memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryJsonSave tool logic
 */
export class MemoryJsonSaveTool extends BaseDeclarativeTool<
    MemoryJsonSaveToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_json_save';

    constructor() {
        super(
            MemoryJsonSaveTool.Name,
            'MemoryJsonSave',
            'Saves a JSON object to memory storage. Returns the memory ID of the saved entry which can be used for later retrieval, updates, or deletion.',
            Kind.Edit,
            {
                properties: {
                    json: {
                        description: 'The JSON object to save to memory storage.',
                        type: 'object',
                    },
                },
                required: ['json'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryJsonSaveToolParams,
    ): string | null {
        if (params.json === null || params.json === undefined) {
            return "The 'json' parameter must be a valid object.";
        }

        if (typeof params.json !== 'object' || Array.isArray(params.json)) {
            return "The 'json' parameter must be a JSON object, not an array or primitive.";
        }

        return null;
    }

    protected createInvocation(
        params: MemoryJsonSaveToolParams,
    ): ToolInvocation<MemoryJsonSaveToolParams, ToolResult> {
        return new MemoryJsonSaveToolInvocation(params);
    }
}
