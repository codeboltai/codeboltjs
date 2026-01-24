import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogInstanceResponse } from '../../types/eventLog';

export interface EventLogDeleteInstanceParams {
    instanceId: string;
}

class EventLogDeleteInstanceInvocation extends BaseToolInvocation<EventLogDeleteInstanceParams, ToolResult> {
    constructor(params: EventLogDeleteInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogInstanceResponse = await eventLog.deleteInstance(this.params.instanceId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to delete event log instance'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to delete event log instance'}`,
                    error: { message: response.error || response.message || 'Failed to delete event log instance', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Event log instance deleted successfully`,
                returnDisplay: `Deleted event log instance with ID: ${this.params.instanceId}`,
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

export class EventLogDeleteInstanceTool extends BaseDeclarativeTool<EventLogDeleteInstanceParams, ToolResult> {
    constructor() {
        super('eventlog_delete_instance', 'Delete Event Log Instance', 'Delete an event log instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'ID of the event log instance to delete' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: EventLogDeleteInstanceParams): ToolInvocation<EventLogDeleteInstanceParams, ToolResult> {
        return new EventLogDeleteInstanceInvocation(params);
    }
}
