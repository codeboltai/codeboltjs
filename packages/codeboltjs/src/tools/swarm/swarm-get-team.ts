/**
 * Swarm Get Team Tool - Gets details of a specific team
 * Wraps the SDK's swarmService.getTeam() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmGetTeam tool
 */
export interface SwarmGetTeamToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the team to retrieve
     */
    team_id: string;
}

class SwarmGetTeamToolInvocation extends BaseToolInvocation<
    SwarmGetTeamToolParams,
    ToolResult
> {
    constructor(params: SwarmGetTeamToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.getTeam(
                this.params.swarm_id,
                this.params.team_id
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved team details',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting team: ${errorMessage}`,
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
 * Implementation of the SwarmGetTeam tool
 */
export class SwarmGetTeamTool extends BaseDeclarativeTool<
    SwarmGetTeamToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_get_team';

    constructor() {
        super(
            SwarmGetTeamTool.Name,
            'SwarmGetTeam',
            'Gets details of a specific team including its members.',
            Kind.Read,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    team_id: {
                        description: 'The ID of the team to retrieve',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'team_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmGetTeamToolParams,
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
        params: SwarmGetTeamToolParams,
    ): ToolInvocation<SwarmGetTeamToolParams, ToolResult> {
        return new SwarmGetTeamToolInvocation(params);
    }
}
