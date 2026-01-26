/**
 * Swarm Join Team Tool - Adds an agent to a team
 * Wraps the SDK's swarmService.joinTeam() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmJoinTeam tool
 */
export interface SwarmJoinTeamToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the team to join
     */
    team_id: string;

    /**
     * The ID of the agent joining the team
     */
    agent_id: string;
}

class SwarmJoinTeamToolInvocation extends BaseToolInvocation<
    SwarmJoinTeamToolParams,
    ToolResult
> {
    constructor(params: SwarmJoinTeamToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.joinTeam(
                this.params.swarm_id,
                this.params.team_id,
                this.params.agent_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully joined team',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error joining team: ${errorMessage}`,
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
 * Implementation of the SwarmJoinTeam tool
 */
export class SwarmJoinTeamTool extends BaseDeclarativeTool<
    SwarmJoinTeamToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_join_team';

    constructor() {
        super(
            SwarmJoinTeamTool.Name,
            'SwarmJoinTeam',
            'Adds an agent to a team within a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    team_id: {
                        description: 'The ID of the team to join',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent joining the team',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'team_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmJoinTeamToolParams,
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
        params: SwarmJoinTeamToolParams,
    ): ToolInvocation<SwarmJoinTeamToolParams, ToolResult> {
        return new SwarmJoinTeamToolInvocation(params);
    }
}
