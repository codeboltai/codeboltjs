import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogStatsResponse } from '../../types/eventLog';

export interface EventLogGetInstanceStatsParams {
    instanceId: string;
}

class EventLogGetInstanceStatsInvocation extends BaseToolInvocation<EventLogGetInstanceStatsParams, ToolResult> {
    constructor(params: EventLogGetInstanceStatsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogStatsResponse = await eventLog.getInstanceStats(this.params.instanceId);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to get instance stats'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to get instance stats'}`,
                    error: { message: response.error || response.message || 'Failed to get instance stats', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const stats = response.data;
            return {
                llmContent: `Instance "${stats.name}" has ${stats.eventCount} event(s)`,
                returnDisplay: JSON.stringify(stats, null, 2),
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class EventLogGetInstanceStatsTool extends BaseDeclarativeTool<EventLogGetInstanceStatsParams, ToolResult> {
    constructor() {
        super('eventlog_get_instance_stats', 'Get Instance Stats', 'Get statistics for an event log instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'ID of the event log instance' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: EventLogGetInstanceStatsParams): ToolInvocation<EventLogGetInstanceStatsParams, ToolResult> {
        return new EventLogGetInstanceStatsInvocation(params);
    }
}
