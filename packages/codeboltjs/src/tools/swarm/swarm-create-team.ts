/**
 * Swarm Create Team Tool - Creates a new team in a swarm
 * Wraps the SDK's swarmService.createTeam() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmCreateTeam tool
 */
export interface SwarmCreateTeamToolParams {
    /**
     * The ID of the swarm to create the team in
     */
    swarm_id: string;

    /**
     * The name of the team
     */
    name: string;

    /**
     * Optional description of the team
     */
    description?: string;

    /**
     * Maximum number of members allowed in the team
     */
    max_members?: number;

    /**
     * The ID of the agent creating the team
     */
    created_by: string;

    /**
     * Optional metadata for the team
     */
    metadata?: Record<string, any>;
}

class SwarmCreateTeamToolInvocation extends BaseToolInvocation<
    SwarmCreateTeamToolParams,
    ToolResult
> {
    constructor(params: SwarmCreateTeamToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.createTeam(this.params.swarm_id, {
                name: this.params.name,
                description: this.params.description,
                maxMembers: this.params.max_members,
                createdBy: this.params.created_by,
                metadata: this.params.metadata,
            });

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully created team',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating team: ${errorMessage}`,
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
 * Implementation of the SwarmCreateTeam tool
 */
export class SwarmCreateTeamTool extends BaseDeclarativeTool<
    SwarmCreateTeamToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_create_team';

    constructor() {
        super(
            SwarmCreateTeamTool.Name,
            'SwarmCreateTeam',
            'Creates a new team within a swarm for organizing agents.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm to create the team in',
                        type: 'string',
                    },
                    name: {
                        description: 'The name of the team',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the team',
                        type: 'string',
                    },
                    max_members: {
                        description: 'Maximum number of members allowed in the team',
                        type: 'number',
                    },
                    created_by: {
                        description: 'The ID of the agent creating the team',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Optional metadata for the team',
                        type: 'object',
                    },
                },
                required: ['swarm_id', 'name', 'created_by'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmCreateTeamToolParams,
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
        params: SwarmCreateTeamToolParams,
    ): ToolInvocation<SwarmCreateTeamToolParams, ToolResult> {
        return new SwarmCreateTeamToolInvocation(params);
    }
}
