/**
 * Memory Markdown Delete Tool - Deletes markdown data from memory storage
 * Wraps the SDK's cbmemory.markdown.delete() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryMarkdownDelete tool
 */
export interface MemoryMarkdownDeleteToolParams {
    /**
     * The memory ID of the entry to delete
     */
    memoryId: string;
}

class MemoryMarkdownDeleteToolInvocation extends BaseToolInvocation<
    MemoryMarkdownDeleteToolParams,
    ToolResult
> {
    constructor(params: MemoryMarkdownDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbmemory.markdown.delete(this.params.memoryId);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error deleting markdown from memory: ${errorMsg}`,
                    returnDisplay: `Error deleting markdown from memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted markdown from memory. Memory ID: ${this.params.memoryId}`,
                returnDisplay: `Successfully deleted markdown from memory (ID: ${this.params.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting markdown from memory: ${errorMessage}`,
                returnDisplay: `Error deleting markdown from memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryMarkdownDelete tool logic
 */
export class MemoryMarkdownDeleteTool extends BaseDeclarativeTool<
    MemoryMarkdownDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_markdown_delete';

    constructor() {
        super(
            MemoryMarkdownDeleteTool.Name,
            'MemoryMarkdownDelete',
            'Deletes markdown content from memory storage by its memory ID. This action is permanent and cannot be undone.',
            Kind.Delete,
            {
                properties: {
                    memoryId: {
                        description: 'The unique identifier of the memory entry to delete.',
                        type: 'string',
                    },
                },
                required: ['memoryId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryMarkdownDeleteToolParams,
    ): string | null {
        if (!params.memoryId || params.memoryId.trim() === '') {
            return "The 'memoryId' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: MemoryMarkdownDeleteToolParams,
    ): ToolInvocation<MemoryMarkdownDeleteToolParams, ToolResult> {
        return new MemoryMarkdownDeleteToolInvocation(params);
    }
}
