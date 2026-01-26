import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IGetAgentsParams, IGetAgentsResponse } from '../../modules/episodicMemory';

export interface EpisodicGetAgentsParams extends IGetAgentsParams {}

class EpisodicGetAgentsInvocation extends BaseToolInvocation<EpisodicGetAgentsParams, ToolResult> {
    constructor(params: EpisodicGetAgentsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IGetAgentsResponse = await episodicMemory.getAgents(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to get agents'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to get agents'}`,
                    error: { message: response.error?.message || 'Failed to get agents', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const agents = response.data;
            return {
                llmContent: `Found ${agents.length} unique agent(s)`,
                returnDisplay: JSON.stringify(agents, null, 2),
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

export class EpisodicGetAgentsTool extends BaseDeclarativeTool<EpisodicGetAgentsParams, ToolResult> {
    constructor() {
        super('episodic_get_agents', 'Get Agents', 'Get unique agent IDs from an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicGetAgentsParams): ToolInvocation<EpisodicGetAgentsParams, ToolResult> {
        return new EpisodicGetAgentsInvocation(params);
    }
}
