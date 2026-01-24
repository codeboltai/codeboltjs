/**
 * Episodic Memory Get Tool - Gets a specific episodic memory by ID
 * Wraps the SDK's cbepisodicMemory.getMemory() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryGet tool
 */
export interface EpisodicMemoryGetToolParams {
    /**
     * The ID of the episodic memory to retrieve
     */
    memoryId: string;
}

class EpisodicMemoryGetToolInvocation extends BaseToolInvocation<
    EpisodicMemoryGetToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.getMemory({
                memoryId: this.params.memoryId,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error getting episodic memory: ${errorMsg}`,
                    returnDisplay: `Error getting episodic memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const memory = response.data;
            return {
                llmContent: `Successfully retrieved episodic memory.\n\nMemory Details:\n${JSON.stringify(memory, null, 2)}`,
                returnDisplay: `Successfully retrieved episodic memory (ID: ${memory?.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting episodic memory: ${errorMessage}`,
                returnDisplay: `Error getting episodic memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryGet tool logic
 */
export class EpisodicMemoryGetTool extends BaseDeclarativeTool<
    EpisodicMemoryGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_get';

    constructor() {
        super(
            EpisodicMemoryGetTool.Name,
            'EpisodicMemoryGet',
            'Retrieves a specific episodic memory by its ID. Returns the memory details including title, creation date, update date, archived status, and event count.',
            Kind.Read,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the episodic memory to retrieve.',
                        type: 'string',
                    },
                },
                required: ['memoryId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryGetToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryGetToolParams,
    ): ToolInvocation<EpisodicMemoryGetToolParams, ToolResult> {
        return new EpisodicMemoryGetToolInvocation(params);
    }
}
