import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { ICreateMemoryParams, ICreateMemoryResponse } from '../../modules/episodicMemory';

export interface EpisodicCreateMemoryParams extends ICreateMemoryParams {}

class EpisodicCreateMemoryInvocation extends BaseToolInvocation<EpisodicCreateMemoryParams, ToolResult> {
    constructor(params: EpisodicCreateMemoryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ICreateMemoryResponse = await episodicMemory.createMemory(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to create episodic memory'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to create episodic memory'}`,
                    error: { message: response.error?.message || 'Failed to create episodic memory', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const memory = response.data;
            return {
                llmContent: `Episodic memory "${memory.title}" created successfully with ID: ${memory.id}`,
                returnDisplay: `Created episodic memory: ${memory.title} (ID: ${memory.id})`,
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

export class EpisodicCreateMemoryTool extends BaseDeclarativeTool<EpisodicCreateMemoryParams, ToolResult> {
    constructor() {
        super('episodic_create_memory', 'Create Episodic Memory', 'Create a new episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Title of the episodic memory' },
            },
            required: ['title'],
        });
    }

    protected override createInvocation(params: EpisodicCreateMemoryParams): ToolInvocation<EpisodicCreateMemoryParams, ToolResult> {
        return new EpisodicCreateMemoryInvocation(params);
    }
}
