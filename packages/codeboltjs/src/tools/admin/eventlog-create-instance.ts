/**
 * EventLog Create Instance Tool - Creates a new event log instance
 * Wraps the SDK's eventLog.createInstance() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';

/**
 * Parameters for the EventLogCreateInstance tool
 */
export interface EventLogCreateInstanceToolParams {
    /**
     * Name for the new event log instance
     */
    name: string;

    /**
     * Optional description for the event log instance
     */
    description?: string;
}

class EventLogCreateInstanceToolInvocation extends BaseToolInvocation<
    EventLogCreateInstanceToolParams,
    ToolResult
> {
    constructor(params: EventLogCreateInstanceToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await eventLog.createInstance(
                this.params.name,
                this.params.description
            );

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error creating event log instance: ${errorMsg}`,
                    returnDisplay: `Error creating event log instance: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const instance = response.data?.instance;
            const resultContent = instance
                ? `Successfully created event log instance:\nID: ${instance.id}\nName: ${instance.name}${instance.description ? `\nDescription: ${instance.description}` : ''}\nCreated At: ${instance.createdAt}`
                : 'Event log instance created successfully';

            return {
                llmContent: resultContent,
                returnDisplay: `Created event log instance: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating event log instance: ${errorMessage}`,
                returnDisplay: `Error creating event log instance: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EventLogCreateInstance tool logic
 */
export class EventLogCreateInstanceTool extends BaseDeclarativeTool<
    EventLogCreateInstanceToolParams,
    ToolResult
> {
    static readonly Name: string = 'eventlog_create_instance';

    constructor() {
        super(
            EventLogCreateInstanceTool.Name,
            'EventLogCreateInstance',
            'Creates a new event log instance for logging agent activities. An event log instance serves as a container for related events.',
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name for the new event log instance',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description for the event log instance',
                        type: 'string',
                    },
                },
                required: ['name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EventLogCreateInstanceToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: EventLogCreateInstanceToolParams,
    ): ToolInvocation<EventLogCreateInstanceToolParams, ToolResult> {
        return new EventLogCreateInstanceToolInvocation(params);
    }
}
