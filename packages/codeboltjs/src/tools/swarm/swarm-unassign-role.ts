/**
 * Swarm Unassign Role Tool - Unassigns a role from an agent
 * Wraps the SDK's swarmService.unassignRole() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmUnassignRole tool
 */
export interface SwarmUnassignRoleToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the role to unassign
     */
    role_id: string;

    /**
     * The ID of the agent to unassign the role from
     */
    agent_id: string;
}

class SwarmUnassignRoleToolInvocation extends BaseToolInvocation<
    SwarmUnassignRoleToolParams,
    ToolResult
> {
    constructor(params: SwarmUnassignRoleToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.unassignRole(
                this.params.swarm_id,
                this.params.role_id,
                this.params.agent_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully unassigned role from agent',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error unassigning role: ${errorMessage}`,
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
 * Implementation of the SwarmUnassignRole tool
 */
export class SwarmUnassignRoleTool extends BaseDeclarativeTool<
    SwarmUnassignRoleToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_unassign_role';

    constructor() {
        super(
            SwarmUnassignRoleTool.Name,
            'SwarmUnassignRole',
            'Unassigns a role from an agent within a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    role_id: {
                        description: 'The ID of the role to unassign',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent to unassign the role from',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'role_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmUnassignRoleToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.role_id || params.role_id.trim() === '') {
            return "The 'role_id' parameter must be non-empty.";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmUnassignRoleToolParams,
    ): ToolInvocation<SwarmUnassignRoleToolParams, ToolResult> {
        return new SwarmUnassignRoleToolInvocation(params);
    }
}
