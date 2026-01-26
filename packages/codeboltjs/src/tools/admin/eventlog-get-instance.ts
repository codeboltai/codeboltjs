/**
 * EventLog Get Instance Tool - Gets an event log instance by ID
 * Wraps the SDK's eventLog.getInstance() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';

/**
 * Parameters for the EventLogGetInstance tool
 */
export interface EventLogGetInstanceToolParams {
    /**
     * The ID of the event log instance to retrieve
     */
    instance_id: string;
}

class EventLogGetInstanceToolInvocation extends BaseToolInvocation<
    EventLogGetInstanceToolParams,
    ToolResult
> {
    constructor(params: EventLogGetInstanceToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await eventLog.getInstance(this.params.instance_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting event log instance: ${errorMsg}`,
                    returnDisplay: `Error getting event log instance: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const instance = response.data?.instance;
            if (!instance) {
                return {
                    llmContent: `Event log instance not found: ${this.params.instance_id}`,
                    returnDisplay: `Event log instance not found`,
                    error: {
                        message: `Instance not found: ${this.params.instance_id}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resultContent = `Event Log Instance:\nID: ${instance.id}\nName: ${instance.name}${instance.description ? `\nDescription: ${instance.description}` : ''}\nCreated At: ${instance.createdAt}\nUpdated At: ${instance.updatedAt}`;

            return {
                llmContent: resultContent,
                returnDisplay: `Retrieved event log instance: ${instance.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting event log instance: ${errorMessage}`,
                returnDisplay: `Error getting event log instance: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EventLogGetInstance tool logic
 */
export class EventLogGetInstanceTool extends BaseDeclarativeTool<
    EventLogGetInstanceToolParams,
    ToolResult
> {
    static readonly Name: string = 'eventlog_get_instance';

    constructor() {
        super(
            EventLogGetInstanceTool.Name,
            'EventLogGetInstance',
            'Gets an event log instance by its ID. Returns the instance details including name, description, and timestamps.',
            Kind.Read,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the event log instance to retrieve',
                        type: 'string',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EventLogGetInstanceToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: EventLogGetInstanceToolParams,
    ): ToolInvocation<EventLogGetInstanceToolParams, ToolResult> {
        return new EventLogGetInstanceToolInvocation(params);
    }
}
