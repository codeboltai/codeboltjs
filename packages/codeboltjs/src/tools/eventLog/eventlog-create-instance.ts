import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';
import type { EventLogInstanceResponse } from '../../types/eventLog';

export interface EventLogCreateInstanceParams {
    name: string;
    description?: string;
}

class EventLogCreateInstanceInvocation extends BaseToolInvocation<EventLogCreateInstanceParams, ToolResult> {
    constructor(params: EventLogCreateInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: EventLogInstanceResponse = await eventLog.createInstance(this.params.name, this.params.description);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error || response.message || 'Failed to create event log instance'}`,
                    returnDisplay: `Error: ${response.error || response.message || 'Failed to create event log instance'}`,
                    error: { message: response.error || response.message || 'Failed to create event log instance', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const instance = response.data.instance;
            return {
                llmContent: `Event log instance "${instance.name}" created successfully with ID: ${instance.id}`,
                returnDisplay: `Created event log instance: ${instance.name} (ID: ${instance.id})`,
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

export class EventLogCreateInstanceTool extends BaseDeclarativeTool<EventLogCreateInstanceParams, ToolResult> {
    constructor() {
        super('eventlog_create_instance', 'Create Event Log Instance', 'Create a new event log instance', Kind.Other, {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Name of the event log instance' },
                description: { type: 'string', description: 'Description of the event log instance' },
            },
            required: ['name'],
        });
    }

    protected override createInvocation(params: EventLogCreateInstanceParams): ToolInvocation<EventLogCreateInstanceParams, ToolResult> {
        return new EventLogCreateInstanceInvocation(params);
    }
}
