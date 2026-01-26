import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

export interface PersistentMemoryDeleteParams {
    memoryId: string;
}

class PersistentMemoryDeleteInvocation extends BaseToolInvocation<PersistentMemoryDeleteParams, ToolResult> {
    constructor(params: PersistentMemoryDeleteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.delete(this.params.memoryId);
            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: { message: errorMsg, type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Persistent memory deleted: ${this.params.memoryId}`,
                returnDisplay: `Deleted persistent memory: ${this.params.memoryId}`,
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

export class PersistentMemoryDeleteTool extends BaseDeclarativeTool<PersistentMemoryDeleteParams, ToolResult> {
    constructor() {
        super('persistent_memory_delete', 'Delete Persistent Memory', 'Delete a persistent memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'Memory ID' },
            },
            required: ['memoryId'],
        });
    }

    protected override createInvocation(params: PersistentMemoryDeleteParams): ToolInvocation<PersistentMemoryDeleteParams, ToolResult> {
        return new PersistentMemoryDeleteInvocation(params);
    }
}
