/**
 * Event Add Running Agent Tool - Adds a running background agent to tracking
 * Wraps the SDK's codeboltEvent.addRunningAgent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for the EventAddRunningAgent tool
 */
export interface EventAddRunningAgentParams {
    /**
     * The thread ID of the background agent
     */
    thread_id: string;

    /**
     * The agent data to store
     */
    data: any;

    /**
     * Optional group ID for grouping agents
     */
    group_id?: string;
}

class EventAddRunningAgentInvocation extends BaseToolInvocation<
    EventAddRunningAgentParams,
    ToolResult
> {
    constructor(params: EventAddRunningAgentParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            codeboltEvent.addRunningAgent(
                this.params.thread_id,
                this.params.data,
                this.params.group_id
            );

            let llmContent = `Background agent added to tracking.\nThread ID: ${this.params.thread_id}`;
            if (this.params.group_id) {
                llmContent += `\nGroup ID: ${this.params.group_id}`;
            }

            return {
                llmContent,
                returnDisplay: `Agent added: ${this.params.thread_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding running agent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for adding a running background agent to tracking
 */
export class EventAddRunningAgentTool extends BaseDeclarativeTool<
    EventAddRunningAgentParams,
    ToolResult
> {
    static readonly Name: string = 'event_add_running_agent';

    constructor() {
        super(
            EventAddRunningAgentTool.Name,
            'Add Running Agent',
            'Add a running background agent to the tracking system. This allows monitoring and waiting for agent completion.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    thread_id: {
                        type: 'string',
                        description: 'The thread ID of the background agent'
                    },
                    data: {
                        description: 'The agent data to store'
                    },
                    group_id: {
                        type: 'string',
                        description: 'Optional group ID for grouping agents'
                    }
                },
                required: ['thread_id', 'data']
            }
        );
    }

    protected override validateToolParamValues(
        params: EventAddRunningAgentParams,
    ): string | null {
        if (!params.thread_id || params.thread_id.trim() === '') {
            return "The 'thread_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: EventAddRunningAgentParams,
    ): ToolInvocation<EventAddRunningAgentParams, ToolResult> {
        return new EventAddRunningAgentInvocation(params);
    }
}
