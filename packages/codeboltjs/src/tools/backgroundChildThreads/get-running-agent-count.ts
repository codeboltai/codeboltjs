/**
 * Background Child Threads - Get Running Agent Count Tool
 * 
 * Gets the count of currently running background agents.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import backgroundChildThreads from '../../modules/backgroundChildThreads';

/**
 * Parameters for getting running agent count (none required)
 */
export interface GetRunningAgentCountParams {
}

class GetRunningAgentCountInvocation extends BaseToolInvocation<GetRunningAgentCountParams, ToolResult> {
    constructor(params: GetRunningAgentCountParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const count = backgroundChildThreads.getRunningAgentCount();

            return {
                llmContent: `Currently ${count} background agent(s) running`,
                returnDisplay: `Count: ${count}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
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
 * Tool for getting running agent count
 */
export class GetRunningAgentCountTool extends BaseDeclarativeTool<GetRunningAgentCountParams, ToolResult> {
    constructor() {
        super(
            'background_threads_get_running_count',
            'Get Running Agent Count',
            'Gets the number of currently running background agents.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: GetRunningAgentCountParams): ToolInvocation<GetRunningAgentCountParams, ToolResult> {
        return new GetRunningAgentCountInvocation(params);
    }
}
