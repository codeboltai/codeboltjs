import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IUpdateTitleParams, IUpdateTitleResponse } from '../../modules/episodicMemory';

export interface EpisodicUpdateTitleParams extends IUpdateTitleParams {}

class EpisodicUpdateTitleInvocation extends BaseToolInvocation<EpisodicUpdateTitleParams, ToolResult> {
    constructor(params: EpisodicUpdateTitleParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IUpdateTitleResponse = await episodicMemory.updateTitle(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to update episodic memory title'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to update episodic memory title'}`,
                    error: { message: response.error?.message || 'Failed to update episodic memory title', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Episodic memory title updated successfully to "${this.params.title}"`,
                returnDisplay: response.data.message || `Title updated to: ${this.params.title}`,
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

export class EpisodicUpdateTitleTool extends BaseDeclarativeTool<EpisodicUpdateTitleParams, ToolResult> {
    constructor() {
        super('episodic_update_title', 'Update Memory Title', 'Update the title of an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
                title: { type: 'string', description: 'New title for the episodic memory' },
            },
            required: ['title'],
        });
    }

    protected override createInvocation(params: EpisodicUpdateTitleParams): ToolInvocation<EpisodicUpdateTitleParams, ToolResult> {
        return new EpisodicUpdateTitleInvocation(params);
    }
}
