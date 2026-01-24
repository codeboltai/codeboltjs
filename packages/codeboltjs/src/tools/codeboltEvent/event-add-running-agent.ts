/**
 * Event Add Running Agent Tool
 * 
 * Adds a running background agent to tracking.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeboltEvent from '../../modules/codeboltEvent';

/**
 * Parameters for adding a running agent
 */
export interface EventAddRunningAgentParams {
    /** The thread ID */
    threadId: string;
    /** The agent data */
    data: any;
    /** Optional group ID */
    groupId?: string;
}

class EventAddRunningAgentInvocation extends BaseToolInvocation<EventAddRunningAgentParams, ToolResult> {
    constructor(params: EventAddRunningAgentParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            cbcodeboltEvent.addRunningAgent(
                this.params.threadId,
                this.params.data,
                this.params.groupId
            );

            const groupInfo = this.params.groupId ? ` to group ${this.params.groupId}` : '';
            return {
                llmContent: `Successfully added running agent ${this.params.threadId}${groupInfo}`,
                returnDisplay: `Added running agent ${this.params.threadId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
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
 * Tool for adding a running agent
 */
export class EventAddRunningAgentTool extends BaseDeclarativeTool<EventAddRunningAgentParams, ToolResult> {
    constructor() {
        super(
            'event_add_running_agent',
            'Add Running Agent',
            'Adds a running background agent to tracking with optional group ID.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    threadId: {
                        type: 'string',
                        description: 'The thread ID',
                    },
                    data: {
                        type: 'object',
                        description: 'The agent data',
                    },
                    groupId: {
                        type: 'string',
                        description: 'Optional group ID',
                    },
                },
                required: ['threadId', 'data'],
            }
        );
    }

    protected override createInvocation(params: EventAddRunningAgentParams): ToolInvocation<EventAddRunningAgentParams, ToolResult> {
        return new EventAddRunningAgentInvocation(params);
    }
}
