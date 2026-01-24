/**
 * Episodic Memory Get Event Types Tool - Gets unique event types from an episodic memory
 * Wraps the SDK's cbepisodicMemory.getEventTypes() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryGetEventTypes tool
 */
export interface EpisodicMemoryGetEventTypesToolParams {
    /**
     * The ID of the episodic memory to get event types from
     */
    memoryId?: string;

    /**
     * The ID of the swarm to get event types from
     */
    swarmId?: string;
}

class EpisodicMemoryGetEventTypesToolInvocation extends BaseToolInvocation<
    EpisodicMemoryGetEventTypesToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryGetEventTypesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.getEventTypes({
                memoryId: this.params.memoryId,
                swarmId: this.params.swarmId,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error getting event types from episodic memory: ${errorMsg}`,
                    returnDisplay: `Error getting event types from episodic memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const eventTypes = response.data || [];
            const typeCount = eventTypes.length;

            return {
                llmContent: `Found ${typeCount} unique event types.\n\n${JSON.stringify(eventTypes, null, 2)}`,
                returnDisplay: `Successfully retrieved ${typeCount} event types from episodic memory`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting event types from episodic memory: ${errorMessage}`,
                returnDisplay: `Error getting event types from episodic memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryGetEventTypes tool logic
 */
export class EpisodicMemoryGetEventTypesTool extends BaseDeclarativeTool<
    EpisodicMemoryGetEventTypesToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_get_event_types';

    constructor() {
        super(
            EpisodicMemoryGetEventTypesTool.Name,
            'EpisodicMemoryGetEventTypes',
            'Retrieves all unique event types from an episodic memory. Useful for understanding what kinds of events have been recorded and for filtering queries.',
            Kind.Read,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the episodic memory to get event types from.',
                        type: 'string',
                    },
                    swarmId: {
                        description: 'The swarm ID to get event types from (alternative to memoryId).',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryGetEventTypesToolParams,
    ): string | null {
        if (!params.memoryId && !params.swarmId) {
            return "Either 'memoryId' or 'swarmId' must be provided.";
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryGetEventTypesToolParams,
    ): ToolInvocation<EpisodicMemoryGetEventTypesToolParams, ToolResult> {
        return new EpisodicMemoryGetEventTypesToolInvocation(params);
    }
}
