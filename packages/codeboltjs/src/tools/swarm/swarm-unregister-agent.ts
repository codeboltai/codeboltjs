/**
 * Swarm Unregister Agent Tool - Unregisters an agent from a swarm
 * Wraps the SDK's swarmService.unregisterAgent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmUnregisterAgent tool
 */
export interface SwarmUnregisterAgentToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the agent to unregister
     */
    agent_id: string;
}

class SwarmUnregisterAgentToolInvocation extends BaseToolInvocation<
    SwarmUnregisterAgentToolParams,
    ToolResult
> {
    constructor(params: SwarmUnregisterAgentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.unregisterAgent(
                this.params.swarm_id,
                this.params.agent_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully unregistered agent from swarm',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error unregistering agent: ${errorMessage}`,
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
 * Implementation of the SwarmUnregisterAgent tool
 */
export class SwarmUnregisterAgentTool extends BaseDeclarativeTool<
    SwarmUnregisterAgentToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_unregister_agent';

    constructor() {
        super(
            SwarmUnregisterAgentTool.Name,
            'SwarmUnregisterAgent',
            'Unregisters an agent from a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent to unregister',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmUnregisterAgentToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmUnregisterAgentToolParams,
    ): ToolInvocation<SwarmUnregisterAgentToolParams, ToolResult> {
        return new SwarmUnregisterAgentToolInvocation(params);
    }
}
