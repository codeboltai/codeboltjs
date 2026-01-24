import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';
import type { UpdatePersistentMemoryParams } from '../../types/persistentMemory';

export interface PersistentMemoryUpdateParams {
    memoryId: string;
    updates: UpdatePersistentMemoryParams;
}

class PersistentMemoryUpdateInvocation extends BaseToolInvocation<PersistentMemoryUpdateParams, ToolResult> {
    constructor(params: PersistentMemoryUpdateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.update(this.params.memoryId, this.params.updates);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Persistent memory updated: ${JSON.stringify(response.data)}`,
                returnDisplay: `Updated persistent memory: ${this.params.memoryId}`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class PersistentMemoryUpdateTool extends BaseDeclarativeTool<PersistentMemoryUpdateParams, ToolResult> {
    constructor() {
        super('persistent_memory_update', 'Update Persistent Memory', 'Update a persistent memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'Memory ID' },
                updates: { 
                    type: 'object',
                    description: 'Update parameters',
                },
            },
            required: ['memoryId', 'updates'],
        });
    }

    protected override createInvocation(params: PersistentMemoryUpdateParams): ToolInvocation<PersistentMemoryUpdateParams, ToolResult> {
        return new PersistentMemoryUpdateInvocation(params);
    }
}
