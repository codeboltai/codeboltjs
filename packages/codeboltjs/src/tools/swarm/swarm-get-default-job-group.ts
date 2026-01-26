/**
 * Swarm Get Default Job Group Tool - Gets the default job group for a swarm
 * Wraps the SDK's swarmService.getDefaultJobGroup() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmGetDefaultJobGroup tool
 */
export interface SwarmGetDefaultJobGroupToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;
}

class SwarmGetDefaultJobGroupToolInvocation extends BaseToolInvocation<
    SwarmGetDefaultJobGroupToolParams,
    ToolResult
> {
    constructor(params: SwarmGetDefaultJobGroupToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.getDefaultJobGroup(this.params.swarm_id);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved default job group',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting default job group: ${errorMessage}`,
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
 * Implementation of the SwarmGetDefaultJobGroup tool
 */
export class SwarmGetDefaultJobGroupTool extends BaseDeclarativeTool<
    SwarmGetDefaultJobGroupToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_get_default_job_group';

    constructor() {
        super(
            SwarmGetDefaultJobGroupTool.Name,
            'SwarmGetDefaultJobGroup',
            'Gets the default job group ID associated with a swarm.',
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
        params: SwarmGetDefaultJobGroupToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmGetDefaultJobGroupToolParams,
    ): ToolInvocation<SwarmGetDefaultJobGroupToolParams, ToolResult> {
        return new SwarmGetDefaultJobGroupToolInvocation(params);
    }
}
