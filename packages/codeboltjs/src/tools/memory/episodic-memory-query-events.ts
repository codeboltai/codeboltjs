/**
 * Episodic Memory Query Events Tool - Queries events from an episodic memory
 * Wraps the SDK's cbepisodicMemory.queryEvents() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryQueryEvents tool
 */
export interface EpisodicMemoryQueryEventsToolParams {
    /**
     * The ID of the episodic memory to query events from
     */
    memoryId?: string;

    /**
     * The ID of the swarm to query events from
     */
    swarmId?: string;

    /**
     * Filter events from the last N minutes
     */
    lastMinutes?: number;

    /**
     * Limit the number of events returned
     */
    lastCount?: number;

    /**
     * Filter events by tags
     */
    tags?: string[];

    /**
     * Filter events by event type
     */
    event_type?: string;

    /**
     * Filter events by emitting agent ID
     */
    emitting_agent_id?: string;

    /**
     * Filter events by team ID
     */
    team_id?: string;

    /**
     * Filter events since a specific timestamp
     */
    since?: string;
}

class EpisodicMemoryQueryEventsToolInvocation extends BaseToolInvocation<
    EpisodicMemoryQueryEventsToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryQueryEventsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.queryEvents({
                memoryId: this.params.memoryId,
                swarmId: this.params.swarmId,
                lastMinutes: this.params.lastMinutes,
                lastCount: this.params.lastCount,
                tags: this.params.tags,
                event_type: this.params.event_type,
                emitting_agent_id: this.params.emitting_agent_id,
                team_id: this.params.team_id,
                since: this.params.since,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error querying events from episodic memory: ${errorMsg}`,
                    returnDisplay: `Error querying events from episodic memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const data = response.data;
            const events = data?.events || [];
            const total = data?.total || 0;
            const filtered = data?.filtered || false;

            return {
                llmContent: `Found ${events.length} events (total: ${total}, filtered: ${filtered}).\n\n${JSON.stringify(events, null, 2)}`,
                returnDisplay: `Successfully queried ${events.length} events from episodic memory`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error querying events from episodic memory: ${errorMessage}`,
                returnDisplay: `Error querying events from episodic memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryQueryEvents tool logic
 */
export class EpisodicMemoryQueryEventsTool extends BaseDeclarativeTool<
    EpisodicMemoryQueryEventsToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_query_events';

    constructor() {
        super(
            EpisodicMemoryQueryEventsTool.Name,
            'EpisodicMemoryQueryEvents',
            'Queries and filters events from an episodic memory. Supports filtering by time range, event type, agent, team, and tags. Returns matching events with metadata.',
            Kind.Read,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the episodic memory to query events from.',
                        type: 'string',
                    },
                    swarmId: {
                        description: 'The swarm ID to query events from (alternative to memoryId).',
                        type: 'string',
                    },
                    lastMinutes: {
                        description: 'Filter events from the last N minutes.',
                        type: 'number',
                    },
                    lastCount: {
                        description: 'Limit the number of events returned.',
                        type: 'number',
                    },
                    tags: {
                        description: 'Filter events that have any of the specified tags.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    event_type: {
                        description: 'Filter events by event type.',
                        type: 'string',
                    },
                    emitting_agent_id: {
                        description: 'Filter events by the agent that emitted them.',
                        type: 'string',
                    },
                    team_id: {
                        description: 'Filter events by team ID.',
                        type: 'string',
                    },
                    since: {
                        description: 'Filter events since a specific timestamp (ISO 8601 format).',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryQueryEventsToolParams,
    ): string | null {
        if (!params.memoryId && !params.swarmId) {
            return "Either 'memoryId' or 'swarmId' must be provided.";
        }

        if (params.lastMinutes !== undefined && params.lastMinutes < 0) {
            return "The 'lastMinutes' parameter must be a non-negative number.";
        }

        if (params.lastCount !== undefined && params.lastCount < 0) {
            return "The 'lastCount' parameter must be a non-negative number.";
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryQueryEventsToolParams,
    ): ToolInvocation<EpisodicMemoryQueryEventsToolParams, ToolResult> {
        return new EpisodicMemoryQueryEventsToolInvocation(params);
    }
}
