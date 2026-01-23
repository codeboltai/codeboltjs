/**
 * Swarm Create Tool - Creates a new swarm
 * Wraps the SDK's swarmService.createSwarm() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmCreate tool
 */
export interface SwarmCreateToolParams {
    /**
     * The name of the swarm
     */
    name: string;

    /**
     * Optional description of the swarm
     */
    description?: string;

    /**
     * Whether to allow external agents to join
     */
    allow_external_agents?: boolean;

    /**
     * Maximum number of agents allowed in the swarm
     */
    max_agents?: number;
}

class SwarmCreateToolInvocation extends BaseToolInvocation<
    SwarmCreateToolParams,
    ToolResult
> {
    constructor(params: SwarmCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.createSwarm({
                name: this.params.name,
                description: this.params.description,
                allowExternalAgents: this.params.allow_external_agents,
                maxAgents: this.params.max_agents,
            });

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully created swarm',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating swarm: ${errorMessage}`,
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
 * Implementation of the SwarmCreate tool
 */
export class SwarmCreateTool extends BaseDeclarativeTool<
    SwarmCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_create';

    constructor() {
        super(
            SwarmCreateTool.Name,
            'SwarmCreate',
            'Creates a new swarm for organizing and managing agents, teams, roles, and vacancies.',
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the swarm',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the swarm',
                        type: 'string',
                    },
                    allow_external_agents: {
                        description: 'Whether to allow external agents to join',
                        type: 'boolean',
                    },
                    max_agents: {
                        description: 'Maximum number of agents allowed in the swarm',
                        type: 'number',
                    },
                },
                required: ['name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmCreateToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmCreateToolParams,
    ): ToolInvocation<SwarmCreateToolParams, ToolResult> {
        return new SwarmCreateToolInvocation(params);
    }
}
