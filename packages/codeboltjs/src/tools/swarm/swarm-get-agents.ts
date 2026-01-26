/**
 * Swarm Get Agents Tool - Gets all agents in a swarm
 * Wraps the SDK's swarmService.getSwarmAgents() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmGetAgents tool
 */
export interface SwarmGetAgentsToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;
}

class SwarmGetAgentsToolInvocation extends BaseToolInvocation<
    SwarmGetAgentsToolParams,
    ToolResult
> {
    constructor(params: SwarmGetAgentsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.getSwarmAgents(this.params.swarm_id);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved swarm agents',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting swarm agents: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the SwarmGetAgents tool
 */
export class SwarmGetAgentsTool extends BaseDeclarativeTool<
    SwarmGetAgentsToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_get_agents';

    constructor() {
        super(
            SwarmGetAgentsTool.Name,
            'SwarmGetAgents',
            'Gets all agents registered in a specific swarm.',
            Kind.Read,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                },
                required: ['swarm_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmGetAgentsToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmGetAgentsToolParams,
    ): ToolInvocation<SwarmGetAgentsToolParams, ToolResult> {
        return new SwarmGetAgentsToolInvocation(params);
    }
}
