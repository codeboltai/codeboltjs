/**
 * Swarm Get Tool - Gets details of a specific swarm
 * Wraps the SDK's swarmService.getSwarm() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmGet tool
 */
export interface SwarmGetToolParams {
    /**
     * The ID of the swarm to retrieve
     */
    swarm_id: string;
}

class SwarmGetToolInvocation extends BaseToolInvocation<
    SwarmGetToolParams,
    ToolResult
> {
    constructor(params: SwarmGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.getSwarm(this.params.swarm_id);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved swarm details',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting swarm: ${errorMessage}`,
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
 * Implementation of the SwarmGet tool
 */
export class SwarmGetTool extends BaseDeclarativeTool<
    SwarmGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_get';

    constructor() {
        super(
            SwarmGetTool.Name,
            'SwarmGet',
            'Gets details of a specific swarm by its ID.',
            Kind.Read,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm to retrieve',
                        type: 'string',
                    },
                },
                required: ['swarm_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmGetToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmGetToolParams,
    ): ToolInvocation<SwarmGetToolParams, ToolResult> {
        return new SwarmGetToolInvocation(params);
    }
}
