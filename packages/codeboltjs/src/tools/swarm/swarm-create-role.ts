/**
 * Swarm Create Role Tool - Creates a new role in a swarm
 * Wraps the SDK's swarmService.createRole() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmCreateRole tool
 */
export interface SwarmCreateRoleToolParams {
    /**
     * The ID of the swarm to create the role in
     */
    swarm_id: string;

    /**
     * The name of the role
     */
    name: string;

    /**
     * Optional description of the role
     */
    description?: string;

    /**
     * Optional permissions associated with the role
     */
    permissions?: string[];

    /**
     * Maximum number of agents that can be assigned this role
     */
    max_assignees?: number;

    /**
     * The ID of the agent creating the role
     */
    created_by: string;

    /**
     * Optional metadata for the role
     */
    metadata?: Record<string, any>;
}

class SwarmCreateRoleToolInvocation extends BaseToolInvocation<
    SwarmCreateRoleToolParams,
    ToolResult
> {
    constructor(params: SwarmCreateRoleToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.createRole(this.params.swarm_id, {
                name: this.params.name,
                description: this.params.description,
                permissions: this.params.permissions,
                maxAssignees: this.params.max_assignees,
                createdBy: this.params.created_by,
                metadata: this.params.metadata,
            });

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully created role',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating role: ${errorMessage}`,
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
 * Implementation of the SwarmCreateRole tool
 */
export class SwarmCreateRoleTool extends BaseDeclarativeTool<
    SwarmCreateRoleToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_create_role';

    constructor() {
        super(
            SwarmCreateRoleTool.Name,
            'SwarmCreateRole',
            'Creates a new role within a swarm with specified permissions and constraints.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm to create the role in',
                        type: 'string',
                    },
                    name: {
                        description: 'The name of the role',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the role',
                        type: 'string',
                    },
                    permissions: {
                        description: 'Optional permissions associated with the role',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    max_assignees: {
                        description: 'Maximum number of agents that can be assigned this role',
                        type: 'number',
                    },
                    created_by: {
                        description: 'The ID of the agent creating the role',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Optional metadata for the role',
                        type: 'object',
                    },
                },
                required: ['swarm_id', 'name', 'created_by'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmCreateRoleToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }
        if (!params.created_by || params.created_by.trim() === '') {
            return "The 'created_by' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmCreateRoleToolParams,
    ): ToolInvocation<SwarmCreateRoleToolParams, ToolResult> {
        return new SwarmCreateRoleToolInvocation(params);
    }
}
