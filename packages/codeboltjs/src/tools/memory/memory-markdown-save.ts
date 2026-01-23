/**
 * Memory Markdown Save Tool - Saves markdown data to memory storage
 * Wraps the SDK's cbmemory.markdown.save() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryMarkdownSave tool
 */
export interface MemoryMarkdownSaveToolParams {
    /**
     * The markdown content to save to memory
     */
    markdown: string;

    /**
     * Optional metadata associated with the markdown
     */
    metadata?: object;
}

class MemoryMarkdownSaveToolInvocation extends BaseToolInvocation<
    MemoryMarkdownSaveToolParams,
    ToolResult
> {
    constructor(params: MemoryMarkdownSaveToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const metadata = this.params.metadata || {};
            const response = await cbmemory.markdown.save(
                this.params.markdown,
                metadata as Record<string, unknown>
            );

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error saving markdown to memory: ${errorMsg}`,
                    returnDisplay: `Error saving markdown to memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Successfully saved markdown to memory. Memory ID: ${response.memoryId}`,
                returnDisplay: `Successfully saved markdown to memory (ID: ${response.memoryId})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error saving markdown to memory: ${errorMessage}`,
                returnDisplay: `Error saving markdown to memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryMarkdownSave tool logic
 */
export class MemoryMarkdownSaveTool extends BaseDeclarativeTool<
    MemoryMarkdownSaveToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_markdown_save';

    constructor() {
        super(
            MemoryMarkdownSaveTool.Name,
            'MemoryMarkdownSave',
            'Saves markdown content to memory storage. Returns the memory ID of the saved entry which can be used for later retrieval, updates, or deletion.',
            Kind.Edit,
            {
                properties: {
                    markdown: {
                        description: 'The markdown content string to save to memory storage.',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Optional metadata to associate with the markdown content.',
                        type: 'object',
                    },
                },
                required: ['markdown'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryMarkdownSaveToolParams,
    ): string | null {
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
        params: MemoryMarkdownSaveToolParams,
    ): ToolInvocation<MemoryMarkdownSaveToolParams, ToolResult> {
        return new MemoryMarkdownSaveToolInvocation(params);
    }
}
