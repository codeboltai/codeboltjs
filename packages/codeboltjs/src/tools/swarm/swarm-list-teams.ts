/**
 * Swarm List Teams Tool - Lists all teams in a swarm
 * Wraps the SDK's swarmService.listTeams() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmListTeams tool
 */
export interface SwarmListTeamsToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;
}

class SwarmListTeamsToolInvocation extends BaseToolInvocation<
    SwarmListTeamsToolParams,
    ToolResult
> {
    constructor(params: SwarmListTeamsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.listTeams(this.params.swarm_id);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved teams list',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing teams: ${errorMessage}`,
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
 * Implementation of the SwarmListTeams tool
 */
export class SwarmListTeamsTool extends BaseDeclarativeTool<
    SwarmListTeamsToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_list_teams';

    constructor() {
        super(
            SwarmListTeamsTool.Name,
            'SwarmListTeams',
            'Lists all teams in a specific swarm.',
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
        params: SwarmListTeamsToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmListTeamsToolParams,
    ): ToolInvocation<SwarmListTeamsToolParams, ToolResult> {
        return new SwarmListTeamsToolInvocation(params);
    }
}
