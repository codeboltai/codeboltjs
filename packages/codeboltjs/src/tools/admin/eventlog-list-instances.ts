/**
 * EventLog List Instances Tool - Lists all event log instances
 * Wraps the SDK's eventLog.listInstances() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import eventLog from '../../modules/eventLog';

/**
 * Parameters for the EventLogListInstances tool
 */
export interface EventLogListInstancesToolParams {
    // No parameters required for listing all instances
}

class EventLogListInstancesToolInvocation extends BaseToolInvocation<
    EventLogListInstancesToolParams,
    ToolResult
> {
    constructor(params: EventLogListInstancesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await eventLog.listInstances();

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing event log instances: ${errorMsg}`,
                    returnDisplay: `Error listing event log instances: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const instances = response.data?.instances || [];

            if (instances.length === 0) {
                return {
                    llmContent: 'No event log instances found.',
                    returnDisplay: 'No event log instances found',
                };
            }

            const instancesList = instances.map((instance, index) =>
                `${index + 1}. ID: ${instance.id}\n   Name: ${instance.name}${instance.description ? `\n   Description: ${instance.description}` : ''}\n   Created: ${instance.createdAt}`
            ).join('\n\n');

            const resultContent = `Event Log Instances (${instances.length} total):\n\n${instancesList}`;

            return {
                llmContent: resultContent,
                returnDisplay: `Listed ${instances.length} event log instance(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing event log instances: ${errorMessage}`,
                returnDisplay: `Error listing event log instances: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EventLogListInstances tool logic
 */
export class EventLogListInstancesTool extends BaseDeclarativeTool<
    EventLogListInstancesToolParams,
    ToolResult
> {
    static readonly Name: string = 'eventlog_list_instances';

    constructor() {
        super(
            EventLogListInstancesTool.Name,
            'EventLogListInstances',
            'Lists all available event log instances. Returns a list of instances with their IDs, names, descriptions, and creation timestamps.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: EventLogListInstancesToolParams,
    ): ToolInvocation<EventLogListInstancesToolParams, ToolResult> {
        return new EventLogListInstancesToolInvocation(params);
    }
}
