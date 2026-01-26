import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogInstanceResponse, UpdateEventLogInstanceParams } from '../../types/eventLog';

export interface EventLogUpdateInstanceParams {
    instanceId: string;
    name?: string;
    description?: string;
}

class EventLogUpdateInstanceInvocation extends BaseToolInvocation<EventLogUpdateInstanceParams, ToolResult> {
    constructor(params: EventLogUpdateInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const { instanceId, ...updates } = this.params;
            const response: EventLogInstanceResponse = await eventLog.updateInstance(instanceId, updates);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to update event log instance'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to update event log instance'}`,
                    error: { message: response.error || response.message || 'Failed to update event log instance', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const instance = response.data.instance;
            return {
                llmContent: `Event log instance "${instance.name}" updated successfully`,
                returnDisplay: `Updated event log instance: ${instance.name} (ID: ${instance.id})`,
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

export class EventLogUpdateInstanceTool extends BaseDeclarativeTool<EventLogUpdateInstanceParams, ToolResult> {
    constructor() {
        super('eventlog_update_instance', 'Update Event Log Instance', 'Update an event log instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'ID of the event log instance' },
                name: { type: 'string', description: 'New name for the instance' },
                description: { type: 'string', description: 'New description for the instance' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: EventLogUpdateInstanceParams): ToolInvocation<EventLogUpdateInstanceParams, ToolResult> {
        return new EventLogUpdateInstanceInvocation(params);
    }
}
