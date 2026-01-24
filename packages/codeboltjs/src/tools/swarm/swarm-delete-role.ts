/**
 * Swarm Delete Role Tool - Deletes a role from a swarm
 * Wraps the SDK's swarmService.deleteRole() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmDeleteRole tool
 */
export interface SwarmDeleteRoleToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the role to delete
     */
    role_id: string;
}

class SwarmDeleteRoleToolInvocation extends BaseToolInvocation<
    SwarmDeleteRoleToolParams,
    ToolResult
> {
    constructor(params: SwarmDeleteRoleToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.deleteRole(
                this.params.swarm_id,
                this.params.role_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully deleted role',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting role: ${errorMessage}`,
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
 * Implementation of the SwarmDeleteRole tool
 */
export class SwarmDeleteRoleTool extends BaseDeclarativeTool<
    SwarmDeleteRoleToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_delete_role';

    constructor() {
        super(
            SwarmDeleteRoleTool.Name,
            'SwarmDeleteRole',
            'Deletes a role from a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    role_id: {
                        description: 'The ID of the role to delete',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'role_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmDeleteRoleToolParams,
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
        params: SwarmDeleteRoleToolParams,
    ): ToolInvocation<SwarmDeleteRoleToolParams, ToolResult> {
        return new SwarmDeleteRoleToolInvocation(params);
    }
}
