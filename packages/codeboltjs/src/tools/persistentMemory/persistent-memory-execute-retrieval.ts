import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';
import type { PipelineExecutionIntent } from '../../types/persistentMemory';

export interface PersistentMemoryExecuteRetrievalParams {
    memoryId: string;
    intent: PipelineExecutionIntent;
}

class PersistentMemoryExecuteRetrievalInvocation extends BaseToolInvocation<PersistentMemoryExecuteRetrievalParams, ToolResult> {
    constructor(params: PersistentMemoryExecuteRetrievalParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.executeRetrieval(this.params.memoryId, this.params.intent);
            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: { message: errorMsg, type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Memory retrieval executed: ${JSON.stringify(response.data)}`,
                returnDisplay: `Executed memory retrieval for: ${this.params.memoryId}`,
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

export class PersistentMemoryExecuteRetrievalTool extends BaseDeclarativeTool<PersistentMemoryExecuteRetrievalParams, ToolResult> {
    constructor() {
        super('persistent_memory_execute_retrieval', 'Execute Memory Retrieval', 'Execute memory retrieval pipeline', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'Memory ID' },
                intent: { 
                    type: 'object',
                    description: 'Execution intent with context',
                },
            },
            required: ['memoryId', 'intent'],
        });
    }

    protected override createInvocation(params: PersistentMemoryExecuteRetrievalParams): ToolInvocation<PersistentMemoryExecuteRetrievalParams, ToolResult> {
        return new PersistentMemoryExecuteRetrievalInvocation(params);
    }
}
