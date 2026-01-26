import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

export interface PersistentMemoryGetParams {
    memoryId: string;
}

class PersistentMemoryGetInvocation extends BaseToolInvocation<PersistentMemoryGetParams, ToolResult> {
    constructor(params: PersistentMemoryGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.get(this.params.memoryId);
            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: { message: errorMsg, type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Persistent memory retrieved: ${JSON.stringify(response.data)}`,
                returnDisplay: `Retrieved persistent memory: ${this.params.memoryId}`,
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

export class PersistentMemoryGetTool extends BaseDeclarativeTool<PersistentMemoryGetParams, ToolResult> {
    constructor() {
        super('persistent_memory_get', 'Get Persistent Memory', 'Get a persistent memory by ID', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'Memory ID' },
            },
            required: ['memoryId'],
        });
    }

    protected override createInvocation(params: PersistentMemoryGetParams): ToolInvocation<PersistentMemoryGetParams, ToolResult> {
        return new PersistentMemoryGetInvocation(params);
    }
}
