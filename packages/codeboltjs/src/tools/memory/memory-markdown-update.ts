/**
 * Memory Markdown Update Tool - Updates existing markdown data in memory storage
 * Wraps the SDK's cbmemory.markdown.update() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryMarkdownUpdate tool
 */
export interface MemoryMarkdownUpdateToolParams {
    /**
     * The memory ID of the entry to update
     */
    memoryId: string;

    /**
     * The new markdown content to replace the existing data
     */
    markdown: string;

    /**
     * Optional metadata to update
     */
    metadata?: object;
}

class MemoryMarkdownUpdateToolInvocation extends BaseToolInvocation<
    MemoryMarkdownUpdateToolParams,
    ToolResult
> {
    constructor(params: MemoryMarkdownUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const metadata = this.params.metadata || {};
            const response = await cbmemory.markdown.update(
                this.params.memoryId,
                this.params.markdown,
                metadata as Record<string, unknown>
            );

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error updating markdown in memory: ${errorMsg}`,
                    returnDisplay: `Error updating markdown in memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully updated markdown in memory. Memory ID: ${response.memoryId}`,
                returnDisplay: `Successfully updated markdown in memory (ID: ${response.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating markdown in memory: ${errorMessage}`,
                returnDisplay: `Error updating markdown in memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryMarkdownUpdate tool logic
 */
export class MemoryMarkdownUpdateTool extends BaseDeclarativeTool<
    MemoryMarkdownUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_markdown_update';

    constructor() {
        super(
            MemoryMarkdownUpdateTool.Name,
            'MemoryMarkdownUpdate',
            'Updates existing markdown content in memory storage by its memory ID. The new markdown content will replace the existing data.',
            Kind.Edit,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the memory entry to update.',
                        type: 'string',
                    },
                    markdown: {
                        description: 'The new markdown content to replace the existing data.',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Optional metadata to update along with the markdown content.',
                        type: 'object',
                    },
                },
                required: ['memoryId', 'markdown'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryMarkdownUpdateToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        if (params.markdown === null || params.markdown === undefined) {
            return "The 'markdown' parameter is required.";
        }

        if (typeof params.markdown !== 'string') {
            return "The 'markdown' parameter must be a string.";
        }

        if (params.metadata !== undefined && params.metadata !== null) {
            if (typeof params.metadata !== 'object' || Array.isArray(params.metadata)) {
                return "The 'metadata' parameter must be an object.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: MemoryMarkdownUpdateToolParams,
    ): ToolInvocation<MemoryMarkdownUpdateToolParams, ToolResult> {
        return new MemoryMarkdownUpdateToolInvocation(params);
    }
}
