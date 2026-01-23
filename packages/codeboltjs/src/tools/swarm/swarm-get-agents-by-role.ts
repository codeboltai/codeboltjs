/**
 * Swarm Get Agents By Role Tool - Gets all agents with a specific role
 * Wraps the SDK's swarmService.getAgentsByRole() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmGetAgentsByRole tool
 */
export interface SwarmGetAgentsByRoleToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the role
     */
    role_id: string;
}

class SwarmGetAgentsByRoleToolInvocation extends BaseToolInvocation<
    SwarmGetAgentsByRoleToolParams,
    ToolResult
> {
    constructor(params: SwarmGetAgentsByRoleToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.getAgentsByRole(
                this.params.swarm_id,
                this.params.role_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved agents by role',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting agents by role: ${errorMessage}`,
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
 * Implementation of the SwarmGetAgentsByRole tool
 */
export class SwarmGetAgentsByRoleTool extends BaseDeclarativeTool<
    SwarmGetAgentsByRoleToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_get_agents_by_role';

    constructor() {
        super(
            SwarmGetAgentsByRoleTool.Name,
            'SwarmGetAgentsByRole',
            'Gets all agents that have been assigned a specific role.',
            Kind.Read,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    role_id: {
                        description: 'The ID of the role',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'role_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmGetAgentsByRoleToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.role_id || params.role_id.trim() === '') {
            return "The 'role_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmGetAgentsByRoleToolParams,
    ): ToolInvocation<SwarmGetAgentsByRoleToolParams, ToolResult> {
        return new SwarmGetAgentsByRoleToolInvocation(params);
    }
}
