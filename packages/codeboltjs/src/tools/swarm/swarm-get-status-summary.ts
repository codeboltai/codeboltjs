/**
 * Swarm Get Status Summary Tool - Gets status summary for a swarm
 * Wraps the SDK's swarmService.getSwarmStatusSummary() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmGetStatusSummary tool
 */
export interface SwarmGetStatusSummaryToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;
}

class SwarmGetStatusSummaryToolInvocation extends BaseToolInvocation<
    SwarmGetStatusSummaryToolParams,
    ToolResult
> {
    constructor(params: SwarmGetStatusSummaryToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.getSwarmStatusSummary(this.params.swarm_id);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved swarm status summary',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting status summary: ${errorMessage}`,
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
 * Implementation of the SwarmGetStatusSummary tool
 */
export class SwarmGetStatusSummaryTool extends BaseDeclarativeTool<
    SwarmGetStatusSummaryToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_get_status_summary';

    constructor() {
        super(
            SwarmGetStatusSummaryTool.Name,
            'SwarmGetStatusSummary',
            'Gets a status summary for a swarm including counts of agents by status.',
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
        params: SwarmGetStatusSummaryToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmGetStatusSummaryToolParams,
    ): ToolInvocation<SwarmGetStatusSummaryToolParams, ToolResult> {
        return new SwarmGetStatusSummaryToolInvocation(params);
    }
}
