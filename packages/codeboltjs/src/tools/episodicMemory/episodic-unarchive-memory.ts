import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IUnarchiveMemoryParams, IUnarchiveMemoryResponse } from '../../modules/episodicMemory';

export interface EpisodicUnarchiveMemoryParams extends IUnarchiveMemoryParams {}

class EpisodicUnarchiveMemoryInvocation extends BaseToolInvocation<EpisodicUnarchiveMemoryParams, ToolResult> {
    constructor(params: EpisodicUnarchiveMemoryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IUnarchiveMemoryResponse = await episodicMemory.unarchiveMemory(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to unarchive episodic memory'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to unarchive episodic memory'}`,
                    error: { message: response.error?.message || 'Failed to unarchive episodic memory', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Episodic memory unarchived successfully`,
                returnDisplay: response.data.message || 'Memory unarchived',
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

export class EpisodicUnarchiveMemoryTool extends BaseDeclarativeTool<EpisodicUnarchiveMemoryParams, ToolResult> {
    constructor() {
        super('episodic_unarchive_memory', 'Unarchive Memory', 'Unarchive an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicUnarchiveMemoryParams): ToolInvocation<EpisodicUnarchiveMemoryParams, ToolResult> {
        return new EpisodicUnarchiveMemoryInvocation(params);
    }
}
