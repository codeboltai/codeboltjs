import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IGetMemoryParams, IGetMemoryResponse } from '../../modules/episodicMemory';

export interface EpisodicGetMemoryParams extends IGetMemoryParams {}

class EpisodicGetMemoryInvocation extends BaseToolInvocation<EpisodicGetMemoryParams, ToolResult> {
    constructor(params: EpisodicGetMemoryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IGetMemoryResponse = await episodicMemory.getMemory(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Episodic memory not found'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Episodic memory not found'}`,
                    error: { message: response.error?.message || 'Episodic memory not found', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const memory = response.data;
            return {
                llmContent: `Episodic memory "${memory.title}" retrieved successfully`,
                returnDisplay: JSON.stringify(memory, null, 2),
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

export class EpisodicGetMemoryTool extends BaseDeclarativeTool<EpisodicGetMemoryParams, ToolResult> {
    constructor() {
        super('episodic_get_memory', 'Get Episodic Memory', 'Get an episodic memory by ID', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicGetMemoryParams): ToolInvocation<EpisodicGetMemoryParams, ToolResult> {
        return new EpisodicGetMemoryInvocation(params);
    }
}
