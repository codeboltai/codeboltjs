/**
 * Episodic Memory List Tool - Lists all episodic memories
 * Wraps the SDK's cbepisodicMemory.listMemories() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryList tool
 */
export interface EpisodicMemoryListToolParams {
    /**
     * Optional filters to apply when listing memories
     */
    filters?: object;
}

class EpisodicMemoryListToolInvocation extends BaseToolInvocation<
    EpisodicMemoryListToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.listMemories();

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error listing episodic memories: ${errorMsg}`,
                    returnDisplay: `Error listing episodic memories: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const memories = response.data || [];
            const memoryCount = memories.length;

            return {
                llmContent: `Found ${memoryCount} episodic memories.\n\n${JSON.stringify(memories, null, 2)}`,
                returnDisplay: `Successfully listed ${memoryCount} episodic memories`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing episodic memories: ${errorMessage}`,
                returnDisplay: `Error listing episodic memories: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryList tool logic
 */
export class EpisodicMemoryListTool extends BaseDeclarativeTool<
    EpisodicMemoryListToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_list';

    constructor() {
        super(
            EpisodicMemoryListTool.Name,
            'EpisodicMemoryList',
            'Lists all episodic memories. Returns an array of memory objects with their IDs, titles, creation dates, and event counts.',
            Kind.Read,
            {
                properties: {
                    filters: {
                        description: 'Optional filters to apply when listing episodic memories. The structure depends on the memory storage implementation.',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryListToolParams,
    ): string | null {
        if (params.filters !== undefined && params.filters !== null) {
            if (typeof params.filters !== 'object' || Array.isArray(params.filters)) {
                return "The 'filters' parameter must be a JSON object.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryListToolParams,
    ): ToolInvocation<EpisodicMemoryListToolParams, ToolResult> {
        return new EpisodicMemoryListToolInvocation(params);
    }
}
