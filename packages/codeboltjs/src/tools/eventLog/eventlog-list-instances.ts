import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogInstanceListResponse } from '../../types/eventLog';

export interface EventLogListInstancesParams {}

class EventLogListInstancesInvocation extends BaseToolInvocation<EventLogListInstancesParams, ToolResult> {
    constructor(params: EventLogListInstancesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogInstanceListResponse = await eventLog.listInstances();
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to list event log instances'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to list event log instances'}`,
                    error: { message: response.error || response.message || 'Failed to list event log instances', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const instances = response.data.instances;
            return {
                llmContent: `Found ${instances.length} event log instance(s)`,
                returnDisplay: JSON.stringify(instances, null, 2),
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

export class EventLogListInstancesTool extends BaseDeclarativeTool<EventLogListInstancesParams, ToolResult> {
    constructor() {
        super('eventlog_list_instances', 'List Event Log Instances', 'List all event log instances', Kind.Other, {
            type: 'object',
            properties: {},
            required: [],
        });
    }

    protected override createInvocation(params: EventLogListInstancesParams): ToolInvocation<EventLogListInstancesParams, ToolResult> {
        return new EventLogListInstancesInvocation(params);
    }
}
