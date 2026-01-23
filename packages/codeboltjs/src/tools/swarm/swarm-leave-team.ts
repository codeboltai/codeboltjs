/**
 * Swarm Leave Team Tool - Removes an agent from a team
 * Wraps the SDK's swarmService.leaveTeam() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmLeaveTeam tool
 */
export interface SwarmLeaveTeamToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the team to leave
     */
    team_id: string;

    /**
     * The ID of the agent leaving the team
     */
    agent_id: string;
}

class SwarmLeaveTeamToolInvocation extends BaseToolInvocation<
    SwarmLeaveTeamToolParams,
    ToolResult
> {
    constructor(params: SwarmLeaveTeamToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.leaveTeam(
                this.params.swarm_id,
                this.params.team_id,
                this.params.agent_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully left team',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error leaving team: ${errorMessage}`,
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
 * Implementation of the SwarmLeaveTeam tool
 */
export class SwarmLeaveTeamTool extends BaseDeclarativeTool<
    SwarmLeaveTeamToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_leave_team';

    constructor() {
        super(
            SwarmLeaveTeamTool.Name,
            'SwarmLeaveTeam',
            'Removes an agent from a team within a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    team_id: {
                        description: 'The ID of the team to leave',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent leaving the team',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'team_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmLeaveTeamToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.team_id || params.team_id.trim() === '') {
            return "The 'team_id' parameter must be non-empty.";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmLeaveTeamToolParams,
    ): ToolInvocation<SwarmLeaveTeamToolParams, ToolResult> {
        return new SwarmLeaveTeamToolInvocation(params);
    }
}
