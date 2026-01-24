import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';
import type { CreatePersistentMemoryParams } from '../../types/persistentMemory';

export interface PersistentMemoryCreateParams {
    config: CreatePersistentMemoryParams;
}

class PersistentMemoryCreateInvocation extends BaseToolInvocation<PersistentMemoryCreateParams, ToolResult> {
    constructor(params: PersistentMemoryCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.create(this.params.config);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Persistent memory created: ${JSON.stringify(response.data)}`,
                returnDisplay: `Created persistent memory: ${response.data?.id || 'unknown'}`,
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

export class PersistentMemoryCreateTool extends BaseDeclarativeTool<PersistentMemoryCreateParams, ToolResult> {
    constructor() {
        super('persistent_memory_create', 'Create Persistent Memory', 'Create a new persistent memory configuration', Kind.Other, {
            type: 'object',
            properties: {
                config: { 
                    type: 'object',
                    description: 'Memory configuration',
                },
            },
            required: ['config'],
        });
    }

    protected override createInvocation(params: PersistentMemoryCreateParams): ToolInvocation<PersistentMemoryCreateParams, ToolResult> {
        return new PersistentMemoryCreateInvocation(params);
    }
}
