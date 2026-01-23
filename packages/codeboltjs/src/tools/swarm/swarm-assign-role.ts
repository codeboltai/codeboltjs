/**
 * Swarm Assign Role Tool - Assigns a role to an agent
 * Wraps the SDK's swarmService.assignRole() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmAssignRole tool
 */
export interface SwarmAssignRoleToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the role to assign
     */
    role_id: string;

    /**
     * The ID of the agent to assign the role to
     */
    agent_id: string;
}

class SwarmAssignRoleToolInvocation extends BaseToolInvocation<
    SwarmAssignRoleToolParams,
    ToolResult
> {
    constructor(params: SwarmAssignRoleToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.assignRole(
                this.params.swarm_id,
                this.params.role_id,
                this.params.agent_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully assigned role to agent',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error assigning role: ${errorMessage}`,
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
 * Implementation of the SwarmAssignRole tool
 */
export class SwarmAssignRoleTool extends BaseDeclarativeTool<
    SwarmAssignRoleToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_assign_role';

    constructor() {
        super(
            SwarmAssignRoleTool.Name,
            'SwarmAssignRole',
            'Assigns a role to an agent within a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    role_id: {
                        description: 'The ID of the role to assign',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent to assign the role to',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'role_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmAssignRoleToolParams,
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
        params: SwarmAssignRoleToolParams,
    ): ToolInvocation<SwarmAssignRoleToolParams, ToolResult> {
        return new SwarmAssignRoleToolInvocation(params);
    }
}
