/**
 * EventLog Get Stats Tool - Gets statistics for an event log
 * Wraps the SDK's eventLog.getInstanceStats() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';

/**
 * Parameters for the EventLogGetStats tool
 */
export interface EventLogGetStatsToolParams {
    /**
     * The ID of the event log instance to get statistics for
     */
    instance_id: string;
}

class EventLogGetStatsToolInvocation extends BaseToolInvocation<
    EventLogGetStatsToolParams,
    ToolResult
> {
    constructor(params: EventLogGetStatsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await eventLog.getInstanceStats(this.params.instance_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting event log stats: ${errorMsg}`,
                    returnDisplay: `Error getting event log stats: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const stats = response.data;
            if (!stats) {
                return {
                    llmContent: `No statistics available for instance: ${this.params.instance_id}`,
                    returnDisplay: `No statistics available`,
                    error: {
                        message: `No stats found for instance: ${this.params.instance_id}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resultContent = `Event Log Statistics:
Instance ID: ${stats.instanceId}
Name: ${stats.name}
Event Count: ${stats.eventCount}
Created At: ${stats.createdAt}
Updated At: ${stats.updatedAt}`;

            return {
                llmContent: resultContent,
                returnDisplay: `Stats for ${stats.name}: ${stats.eventCount} events`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting event log stats: ${errorMessage}`,
                returnDisplay: `Error getting event log stats: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EventLogGetStats tool logic
 */
export class EventLogGetStatsTool extends BaseDeclarativeTool<
    EventLogGetStatsToolParams,
    ToolResult
> {
    static readonly Name: string = 'eventlog_get_stats';

    constructor() {
        super(
            EventLogGetStatsTool.Name,
            'EventLogGetStats',
            'Gets statistics for an event log instance including event count, creation time, and last update time.',
            Kind.Read,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the event log instance to get statistics for',
                        type: 'string',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EventLogGetStatsToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: EventLogGetStatsToolParams,
    ): ToolInvocation<EventLogGetStatsToolParams, ToolResult> {
        return new EventLogGetStatsToolInvocation(params);
    }
}
