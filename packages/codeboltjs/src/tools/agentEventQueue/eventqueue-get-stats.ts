/**
 * EventQueue Get Stats Tool
 * Wraps the SDK's agentEventQueue.getQueueStats() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import agentEventQueue from '../../modules/agentEventQueue';

/**
 * Parameters for the EventQueue Get Stats tool
 */
export interface EventQueueGetStatsParams {
    // No parameters required
}

class EventQueueGetStatsInvocation extends BaseToolInvocation<
    EventQueueGetStatsParams,
    ToolResult
> {
    constructor(params: EventQueueGetStatsParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await agentEventQueue.getQueueStats();

            if (!response.success) {
                return {
                    llmContent: `Failed to get queue stats: ${response.message}`,
                    returnDisplay: `Error: ${response.message}`,
                    error: {
                        message: response.message,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const stats = response.data;
            let llmContent = `Queue Statistics:\n\n`;
            llmContent += `Total Agents: ${stats?.totalAgents || 0}\n`;
            llmContent += `Total Pending: ${stats?.totalPending || 0}\n`;
            llmContent += `Total Delivered: ${stats?.totalDelivered || 0}\n`;

            if (stats?.storage) {
                llmContent += `\nStorage:\n`;
                llmContent += `  Total Events: ${stats.storage.totalEvents}\n`;
                llmContent += `  Index Size: ${stats.storage.indexSize}\n`;
            }

            if (stats?.agentStats && Object.keys(stats.agentStats).length > 0) {
                llmContent += `\nPer-Agent Stats:\n`;
                for (const [agentId, agentStat] of Object.entries(stats.agentStats)) {
                    llmContent += `  ${agentId}: pending=${(agentStat as any).pending}, delivered=${(agentStat as any).delivered}\n`;
                }
            }

            return {
                llmContent,
                returnDisplay: `Queue: ${stats?.totalPending || 0} pending, ${stats?.totalDelivered || 0} delivered`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting queue stats: ${errorMessage}`,
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
 * Tool for getting event queue statistics
 */
export class EventQueueGetStatsTool extends BaseDeclarativeTool<
    EventQueueGetStatsParams,
    ToolResult
> {
    static readonly Name: string = 'eventqueue_get_stats';

    constructor() {
        super(
            EventQueueGetStatsTool.Name,
            'Get Queue Statistics',
            'Get statistics about the agent event queue, including pending and delivered event counts.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: []
            }
        );
    }

    protected createInvocation(
        params: EventQueueGetStatsParams,
    ): ToolInvocation<EventQueueGetStatsParams, ToolResult> {
        return new EventQueueGetStatsInvocation(params);
    }
}
