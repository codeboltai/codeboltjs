import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogInstanceResponse } from '../../types/eventLog';

export interface EventLogGetInstanceParams {
    instanceId: string;
}

class EventLogGetInstanceInvocation extends BaseToolInvocation<EventLogGetInstanceParams, ToolResult> {
    constructor(params: EventLogGetInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogInstanceResponse = await eventLog.getInstance(this.params.instanceId);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Event log instance not found'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Event log instance not found'}`,
                    error: { message: response.error || response.message || 'Event log instance not found', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const instance = response.data.instance;
            return {
                llmContent: `Event log instance "${instance.name}" retrieved successfully`,
                returnDisplay: JSON.stringify(instance, null, 2),
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

export class EventLogGetInstanceTool extends BaseDeclarativeTool<EventLogGetInstanceParams, ToolResult> {
    constructor() {
        super('eventlog_get_instance', 'Get Event Log Instance', 'Get an event log instance by ID', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'ID of the event log instance' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: EventLogGetInstanceParams): ToolInvocation<EventLogGetInstanceParams, ToolResult> {
        return new EventLogGetInstanceInvocation(params);
    }
}
