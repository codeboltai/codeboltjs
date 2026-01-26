/**
 * Swarm Get Role Tool - Gets details of a specific role
 * Wraps the SDK's swarmService.getRole() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmGetRole tool
 */
export interface SwarmGetRoleToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the role to retrieve
     */
    role_id: string;
}

class SwarmGetRoleToolInvocation extends BaseToolInvocation<
    SwarmGetRoleToolParams,
    ToolResult
> {
    constructor(params: SwarmGetRoleToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.getRole(
                this.params.swarm_id,
                this.params.role_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved role details',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting role: ${errorMessage}`,
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
 * Implementation of the SwarmGetRole tool
 */
export class SwarmGetRoleTool extends BaseDeclarativeTool<
    SwarmGetRoleToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_get_role';

    constructor() {
        super(
            SwarmGetRoleTool.Name,
            'SwarmGetRole',
            'Gets details of a specific role including its assignees.',
            Kind.Read,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    role_id: {
                        description: 'The ID of the role to retrieve',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'role_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmGetRoleToolParams,
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
        params: SwarmGetRoleToolParams,
    ): ToolInvocation<SwarmGetRoleToolParams, ToolResult> {
        return new SwarmGetRoleToolInvocation(params);
    }
}
