/**
 * Swarm Register Agent Tool - Registers an agent to a swarm
 * Wraps the SDK's swarmService.registerAgent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmRegisterAgent tool
 */
export interface SwarmRegisterAgentToolParams {
    /**
     * The ID of the swarm to register the agent to
     */
    swarm_id: string;

    /**
     * Optional agent ID (will be generated if not provided)
     */
    agent_id?: string;

    /**
     * The name of the agent
     */
    name: string;

    /**
     * Optional capabilities of the agent
     */
    capabilities?: string[];

    /**
     * Type of agent (internal or external)
     */
    agent_type?: 'internal' | 'external';

    /**
     * Optional connection endpoint for external agents
     */
    connection_endpoint?: string;

    /**
     * Optional connection protocol
     */
    connection_protocol?: 'websocket' | 'http';

    /**
     * Optional metadata for the agent
     */
    metadata?: Record<string, any>;
}

class SwarmRegisterAgentToolInvocation extends BaseToolInvocation<
    SwarmRegisterAgentToolParams,
    ToolResult
> {
    constructor(params: SwarmRegisterAgentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const connectionInfo = this.params.connection_endpoint
                ? {
                    endpoint: this.params.connection_endpoint,
                    protocol: this.params.connection_protocol || 'websocket' as const,
                }
                : undefined;

            const response = await swarmService.registerAgent(this.params.swarm_id, {
                agentId: this.params.agent_id,
                name: this.params.name,
                capabilities: this.params.capabilities,
                agentType: this.params.agent_type,
                connectionInfo,
                metadata: this.params.metadata,
            });

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully registered agent to swarm',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error registering agent: ${errorMessage}`,
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
 * Implementation of the SwarmRegisterAgent tool
 */
export class SwarmRegisterAgentTool extends BaseDeclarativeTool<
    SwarmRegisterAgentToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_register_agent';

    constructor() {
        super(
            SwarmRegisterAgentTool.Name,
            'SwarmRegisterAgent',
            'Registers an agent to a swarm with specified capabilities and configuration.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm to register the agent to',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'Optional agent ID (will be generated if not provided)',
                        type: 'string',
                    },
                    name: {
                        description: 'The name of the agent',
                        type: 'string',
                    },
                    capabilities: {
                        description: 'Optional capabilities of the agent',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    agent_type: {
                        description: 'Type of agent (internal or external)',
                        type: 'string',
                        enum: ['internal', 'external'],
                    },
                    connection_endpoint: {
                        description: 'Optional connection endpoint for external agents',
                        type: 'string',
                    },
                    connection_protocol: {
                        description: 'Optional connection protocol',
                        type: 'string',
                        enum: ['websocket', 'http'],
                    },
                    metadata: {
                        description: 'Optional metadata for the agent',
                        type: 'object',
                    },
                },
                required: ['swarm_id', 'name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmRegisterAgentToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmRegisterAgentToolParams,
    ): ToolInvocation<SwarmRegisterAgentToolParams, ToolResult> {
        return new SwarmRegisterAgentToolInvocation(params);
    }
}
