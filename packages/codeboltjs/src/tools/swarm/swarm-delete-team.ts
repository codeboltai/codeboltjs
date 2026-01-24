/**
 * Swarm Delete Team Tool - Deletes a team from a swarm
 * Wraps the SDK's swarmService.deleteTeam() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmDeleteTeam tool
 */
export interface SwarmDeleteTeamToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the team to delete
     */
    team_id: string;
}

class SwarmDeleteTeamToolInvocation extends BaseToolInvocation<
    SwarmDeleteTeamToolParams,
    ToolResult
> {
    constructor(params: SwarmDeleteTeamToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.deleteTeam(
                this.params.swarm_id,
                this.params.team_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully deleted team',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting team: ${errorMessage}`,
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
 * Implementation of the SwarmDeleteTeam tool
 */
export class SwarmDeleteTeamTool extends BaseDeclarativeTool<
    SwarmDeleteTeamToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_delete_team';

    constructor() {
        super(
            SwarmDeleteTeamTool.Name,
            'SwarmDeleteTeam',
            'Deletes a team from a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    team_id: {
                        description: 'The ID of the team to delete',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'team_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmDeleteTeamToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.team_id || params.team_id.trim() === '') {
            return "The 'team_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmDeleteTeamToolParams,
    ): ToolInvocation<SwarmDeleteTeamToolParams, ToolResult> {
        return new SwarmDeleteTeamToolInvocation(params);
    }
}
