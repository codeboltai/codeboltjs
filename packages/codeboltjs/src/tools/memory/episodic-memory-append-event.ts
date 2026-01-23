/**
 * Episodic Memory Append Event Tool - Appends an event to an episodic memory
 * Wraps the SDK's cbepisodicMemory.appendEvent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryAppendEvent tool
 */
export interface EpisodicMemoryAppendEventToolParams {
    /**
     * The ID of the episodic memory to append the event to
     */
    memoryId: string;

    /**
     * The event object to append
     */
    event: {
        /**
         * The type of the event
         */
        event_type: string;

        /**
         * The ID of the agent emitting the event
         */
        emitting_agent_id: string;

        /**
         * Optional team ID associated with the event
         */
        team_id?: string;

        /**
         * Optional tags for categorizing the event
         */
        tags?: string[];

        /**
         * The payload data of the event
         */
        payload: string | Record<string, any>;
    };
}

class EpisodicMemoryAppendEventToolInvocation extends BaseToolInvocation<
    EpisodicMemoryAppendEventToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryAppendEventToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.appendEvent({
                memoryId: this.params.memoryId,
                event_type: this.params.event.event_type,
                emitting_agent_id: this.params.event.emitting_agent_id,
                team_id: this.params.event.team_id,
                tags: this.params.event.tags,
                payload: this.params.event.payload,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error appending event to episodic memory: ${errorMsg}`,
                    returnDisplay: `Error appending event to episodic memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const event = response.data;
            return {
                llmContent: `Successfully appended event to episodic memory.\n\nEvent Details:\n${JSON.stringify(event, null, 2)}`,
                returnDisplay: `Successfully appended event (ID: ${event?.id}) to memory (ID: ${this.params.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error appending event to episodic memory: ${errorMessage}`,
                returnDisplay: `Error appending event to episodic memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryAppendEvent tool logic
 */
export class EpisodicMemoryAppendEventTool extends BaseDeclarativeTool<
    EpisodicMemoryAppendEventToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_append_event';

    constructor() {
        super(
            EpisodicMemoryAppendEventTool.Name,
            'EpisodicMemoryAppendEvent',
            'Appends a new event to an existing episodic memory. Events are timestamped records that can represent activities, messages, state changes, or any other trackable occurrences.',
            Kind.Edit,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the episodic memory to append the event to.',
                        type: 'string',
                    },
                    event: {
                        description: 'The event object to append to the memory.',
                        type: 'object',
                        properties: {
                            event_type: {
                                description: 'The type/category of the event (e.g., "message", "action", "state_change").',
                                type: 'string',
                            },
                            emitting_agent_id: {
                                description: 'The ID of the agent that is emitting/creating this event.',
                                type: 'string',
                            },
                            team_id: {
                                description: 'Optional team ID to associate with this event.',
                                type: 'string',
                            },
                            tags: {
                                description: 'Optional array of tags for categorizing and filtering events.',
                                type: 'array',
                                items: { type: 'string' },
                            },
                            payload: {
                                description: 'The data payload of the event. Can be a string or an object.',
                                oneOf: [
                                    { type: 'string' },
                                    { type: 'object' },
                                ],
                            },
                        },
                        required: ['event_type', 'emitting_agent_id', 'payload'],
                    },
                },
                required: ['memoryId', 'event'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryAppendEventToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        if (!params.event || typeof params.event !== 'object') {
            return "The 'event' parameter must be a valid object.";
        }

        if (!params.event.event_type || params.event.event_type.trim() === '') {
            return "The 'event.event_type' parameter must be a non-empty string.";
        }

        if (!params.event.emitting_agent_id || params.event.emitting_agent_id.trim() === '') {
            return "The 'event.emitting_agent_id' parameter must be a non-empty string.";
        }

        if (params.event.payload === undefined || params.event.payload === null) {
            return "The 'event.payload' parameter must be provided.";
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryAppendEventToolParams,
    ): ToolInvocation<EpisodicMemoryAppendEventToolParams, ToolResult> {
        return new EpisodicMemoryAppendEventToolInvocation(params);
    }
}
