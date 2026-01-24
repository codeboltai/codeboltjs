import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IGetTagsParams, IGetTagsResponse } from '../../modules/episodicMemory';

export interface EpisodicGetTagsParams extends IGetTagsParams {}

class EpisodicGetTagsInvocation extends BaseToolInvocation<EpisodicGetTagsParams, ToolResult> {
    constructor(params: EpisodicGetTagsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IGetTagsResponse = await episodicMemory.getTags(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to get tags'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to get tags'}`,
                    error: { message: response.error?.message || 'Failed to get tags', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const tags = response.data;
            return {
                llmContent: `Found ${tags.length} unique tag(s)`,
                returnDisplay: JSON.stringify(tags, null, 2),
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

export class EpisodicGetTagsTool extends BaseDeclarativeTool<EpisodicGetTagsParams, ToolResult> {
    constructor() {
        super('episodic_get_tags', 'Get Tags', 'Get unique tags from an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicGetTagsParams): ToolInvocation<EpisodicGetTagsParams, ToolResult> {
        return new EpisodicGetTagsInvocation(params);
    }
}
