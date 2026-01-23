/**
 * Swarm List Roles Tool - Lists all roles in a swarm
 * Wraps the SDK's swarmService.listRoles() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmListRoles tool
 */
export interface SwarmListRolesToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;
}

class SwarmListRolesToolInvocation extends BaseToolInvocation<
    SwarmListRolesToolParams,
    ToolResult
> {
    constructor(params: SwarmListRolesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.listRoles(this.params.swarm_id);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved roles list',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing roles: ${errorMessage}`,
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
 * Implementation of the SwarmListRoles tool
 */
export class SwarmListRolesTool extends BaseDeclarativeTool<
    SwarmListRolesToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_list_roles';

    constructor() {
        super(
            SwarmListRolesTool.Name,
            'SwarmListRoles',
            'Lists all roles defined in a specific swarm.',
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
        params: SwarmListRolesToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmListRolesToolParams,
    ): ToolInvocation<SwarmListRolesToolParams, ToolResult> {
        return new SwarmListRolesToolInvocation(params);
    }
}
