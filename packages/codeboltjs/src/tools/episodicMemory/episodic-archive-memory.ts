import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IArchiveMemoryParams, IArchiveMemoryResponse } from '../../modules/episodicMemory';

export interface EpisodicArchiveMemoryParams extends IArchiveMemoryParams {}

class EpisodicArchiveMemoryInvocation extends BaseToolInvocation<EpisodicArchiveMemoryParams, ToolResult> {
    constructor(params: EpisodicArchiveMemoryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IArchiveMemoryResponse = await episodicMemory.archiveMemory(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to archive episodic memory'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to archive episodic memory'}`,
                    error: { message: response.error?.message || 'Failed to archive episodic memory', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Episodic memory archived successfully`,
                returnDisplay: response.data.message || 'Memory archived',
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

export class EpisodicArchiveMemoryTool extends BaseDeclarativeTool<EpisodicArchiveMemoryParams, ToolResult> {
    constructor() {
        super('episodic_archive_memory', 'Archive Memory', 'Archive an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicArchiveMemoryParams): ToolInvocation<EpisodicArchiveMemoryParams, ToolResult> {
        return new EpisodicArchiveMemoryInvocation(params);
    }
}
