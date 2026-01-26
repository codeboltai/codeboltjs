/**
 * Episodic Memory Update Title Tool - Updates the title of an episodic memory
 * Wraps the SDK's cbepisodicMemory.updateTitle() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbepisodicMemory from '../../modules/episodicMemory';

/**
 * Parameters for the EpisodicMemoryUpdateTitle tool
 */
export interface EpisodicMemoryUpdateTitleToolParams {
    /**
     * The ID of the episodic memory to update
     */
    memoryId: string;

    /**
     * The new title for the episodic memory
     */
    title: string;
}

class EpisodicMemoryUpdateTitleToolInvocation extends BaseToolInvocation<
    EpisodicMemoryUpdateTitleToolParams,
    ToolResult
> {
    constructor(params: EpisodicMemoryUpdateTitleToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbepisodicMemory.updateTitle({
                memoryId: this.params.memoryId,
                title: this.params.title,
            });

            if (!response.success) {
                const errorMsg = response.error?.message || 'Unknown error';
                return {
                    llmContent: `Error updating episodic memory title: ${errorMsg}`,
                    returnDisplay: `Error updating episodic memory title: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const message = response.data?.message || 'Title updated successfully';
            return {
                llmContent: `Successfully updated episodic memory title to "${this.params.title}".\n\n${message}`,
                returnDisplay: `Successfully updated title for episodic memory (ID: ${this.params.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating episodic memory title: ${errorMessage}`,
                returnDisplay: `Error updating episodic memory title: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the EpisodicMemoryUpdateTitle tool logic
 */
export class EpisodicMemoryUpdateTitleTool extends BaseDeclarativeTool<
    EpisodicMemoryUpdateTitleToolParams,
    ToolResult
> {
    static readonly Name: string = 'episodic_memory_update_title';

    constructor() {
        super(
            EpisodicMemoryUpdateTitleTool.Name,
            'EpisodicMemoryUpdateTitle',
            'Updates the title of an existing episodic memory. Useful for renaming memories to better reflect their content or purpose.',
            Kind.Edit,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the episodic memory to update.',
                        type: 'string',
                    },
                    title: {
                        description: 'The new title for the episodic memory.',
                        type: 'string',
                    },
                },
                required: ['memoryId', 'title'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EpisodicMemoryUpdateTitleToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: EpisodicMemoryUpdateTitleToolParams,
    ): ToolInvocation<EpisodicMemoryUpdateTitleToolParams, ToolResult> {
        return new EpisodicMemoryUpdateTitleToolInvocation(params);
    }
}
