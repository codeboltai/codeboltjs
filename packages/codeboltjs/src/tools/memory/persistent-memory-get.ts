/**
 * Persistent Memory Get Tool - Gets a persistent memory by ID
 * Wraps the SDK's persistentMemory.get() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

/**
 * Parameters for the PersistentMemoryGet tool
 */
export interface PersistentMemoryGetToolParams {
    /**
     * The ID of the persistent memory to retrieve
     */
    memory_id: string;
}

class PersistentMemoryGetToolInvocation extends BaseToolInvocation<
    PersistentMemoryGetToolParams,
    ToolResult
> {
    constructor(params: PersistentMemoryGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await persistentMemory.get(this.params.memory_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Failed to get persistent memory';
                return {
                    llmContent: `Error getting persistent memory: ${errorMsg}`,
                    returnDisplay: `Error getting persistent memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const memory = response.data?.memory;
            if (!memory) {
                return {
                    llmContent: `Persistent memory with ID '${this.params.memory_id}' not found`,
                    returnDisplay: `Persistent memory not found`,
                    error: {
                        message: `Memory with ID '${this.params.memory_id}' not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(memory, null, 2),
                returnDisplay: `Successfully retrieved persistent memory: ${memory.label} (${memory.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting persistent memory: ${errorMessage}`,
                returnDisplay: `Error getting persistent memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PersistentMemoryGet tool logic
 */
export class PersistentMemoryGetTool extends BaseDeclarativeTool<
    PersistentMemoryGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'persistent_memory_get';

    constructor() {
        super(
            PersistentMemoryGetTool.Name,
            'PersistentMemoryGet',
            `Retrieves a persistent memory configuration by its ID. Returns the full memory configuration including label, description, status, retrieval settings, and contribution settings.`,
            Kind.Read,
            {
                properties: {
                    memory_id: {
                        description: 'The unique identifier of the persistent memory to retrieve.',
                        type: 'string',
                    },
                },
                required: ['memory_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PersistentMemoryGetToolParams,
    ): string | null {
        if (!params.memory_id || params.memory_id.trim() === '') {
            return "The 'memory_id' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: PersistentMemoryGetToolParams,
    ): ToolInvocation<PersistentMemoryGetToolParams, ToolResult> {
        return new PersistentMemoryGetToolInvocation(params);
    }
}
