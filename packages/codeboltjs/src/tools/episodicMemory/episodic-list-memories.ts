import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IListMemoriesResponse } from '../../modules/episodicMemory';

export interface EpisodicListMemoriesParams {}

class EpisodicListMemoriesInvocation extends BaseToolInvocation<EpisodicListMemoriesParams, ToolResult> {
    constructor(params: EpisodicListMemoriesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IListMemoriesResponse = await episodicMemory.listMemories();
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to list episodic memories'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to list episodic memories'}`,
                    error: { message: response.error?.message || 'Failed to list episodic memories', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const memories = response.data;
            return {
                llmContent: `Found ${memories.length} episodic memor${memories.length === 1 ? 'y' : 'ies'}`,
                returnDisplay: JSON.stringify(memories, null, 2),
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

export class EpisodicListMemoriesTool extends BaseDeclarativeTool<EpisodicListMemoriesParams, ToolResult> {
    constructor() {
        super('episodic_list_memories', 'List Episodic Memories', 'List all episodic memories', Kind.Other, {
            type: 'object',
            properties: {},
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicListMemoriesParams): ToolInvocation<EpisodicListMemoriesParams, ToolResult> {
        return new EpisodicListMemoriesInvocation(params);
    }
}
