import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';
import type { ListPersistentMemoryParams } from '../../types/persistentMemory';

export interface PersistentMemoryListParams {
    filters?: ListPersistentMemoryParams;
}

class PersistentMemoryListInvocation extends BaseToolInvocation<PersistentMemoryListParams, ToolResult> {
    constructor(params: PersistentMemoryListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.list(this.params.filters);
            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: { message: errorMsg, type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const memoriesData = response.data?.memories || [];
            return {
                llmContent: `Found ${memoriesData.length} persistent memories: ${JSON.stringify(memoriesData)}`,
                returnDisplay: `Listed ${memoriesData.length} persistent memories`,
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

export class PersistentMemoryListTool extends BaseDeclarativeTool<PersistentMemoryListParams, ToolResult> {
    constructor() {
        super('persistent_memory_list', 'List Persistent Memories', 'List persistent memories with optional filters', Kind.Other, {
            type: 'object',
            properties: {
                filters: { 
                    type: 'object',
                    description: 'Optional filters',
                },
            },
            required: [],
        });
    }

    protected override createInvocation(params: PersistentMemoryListParams): ToolInvocation<PersistentMemoryListParams, ToolResult> {
        return new PersistentMemoryListInvocation(params);
    }
}
