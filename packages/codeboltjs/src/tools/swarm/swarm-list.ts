/**
 * Swarm List Tool - Lists all available swarms
 * Wraps the SDK's swarmService.listSwarms() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmList tool
 */
export interface SwarmListToolParams {
    // No parameters required
}

class SwarmListToolInvocation extends BaseToolInvocation<
    SwarmListToolParams,
    ToolResult
> {
    constructor(params: SwarmListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.listSwarms();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved swarms list',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing swarms: ${errorMessage}`,
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
 * Implementation of the SwarmList tool
 */
export class SwarmListTool extends BaseDeclarativeTool<
    SwarmListToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_list';

    constructor() {
        super(
            SwarmListTool.Name,
            'SwarmList',
            'Lists all available swarms in the system.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: SwarmListToolParams,
    ): ToolInvocation<SwarmListToolParams, ToolResult> {
        return new SwarmListToolInvocation(params);
    }
}
