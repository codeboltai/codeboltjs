/**
 * Episodic Memory Archive Tool - Archives an episodic memory
 * Wraps the SDK's cbepisodicMemory.archiveMemory() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryArchive tool
 */
export interface EpisodicMemoryArchiveToolParams {
    /**
     * The ID of the episodic memory to archive
     */
    memoryId: string;
}

class EpisodicMemoryArchiveToolInvocation extends BaseToolInvocation<
    EpisodicMemoryArchiveToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryArchiveToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.archiveMemory({
                memoryId: this.params.memoryId,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error archiving episodic memory: ${errorMsg}`,
                    returnDisplay: `Error archiving episodic memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const message = response.data?.message || 'Memory archived successfully';
            return {
                llmContent: `Successfully archived episodic memory.\n\n${message}`,
                returnDisplay: `Successfully archived episodic memory (ID: ${this.params.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error archiving episodic memory: ${errorMessage}`,
                returnDisplay: `Error archiving episodic memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryArchive tool logic
 */
export class EpisodicMemoryArchiveTool extends BaseDeclarativeTool<
    EpisodicMemoryArchiveToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_archive';

    constructor() {
        super(
            EpisodicMemoryArchiveTool.Name,
            'EpisodicMemoryArchive',
            'Archives an episodic memory. Archived memories are preserved but marked as inactive. This is useful for organizing completed workflows or historical data.',
            Kind.Edit,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the episodic memory to archive.',
                        type: 'string',
                    },
                },
                required: ['memoryId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryArchiveToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryArchiveToolParams,
    ): ToolInvocation<EpisodicMemoryArchiveToolParams, ToolResult> {
        return new EpisodicMemoryArchiveToolInvocation(params);
    }
}
