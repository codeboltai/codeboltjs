/**
 * Memory Markdown List Tool - Lists markdown data from memory storage
 * Wraps the SDK's cbmemory.markdown.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryMarkdownList tool
 */
export interface MemoryMarkdownListToolParams {
    /**
     * Optional filters to apply when listing markdown entries
     */
    filters?: object;
}

class MemoryMarkdownListToolInvocation extends BaseToolInvocation<
    MemoryMarkdownListToolParams,
    ToolResult
> {
    constructor(params: MemoryMarkdownListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filters = this.params.filters || {};
            const response = await cbmemory.markdown.list(filters as Record<string, unknown>);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing markdown from memory: ${errorMsg}`,
                    returnDisplay: `Error listing markdown from memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const items = response.items || [];
            const itemCount = items.length;

            return {
                llmContent: `Found ${itemCount} markdown entries in memory.\n\n${JSON.stringify(items, null, 2)}`,
                returnDisplay: `Successfully listed ${itemCount} markdown entries from memory`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing markdown from memory: ${errorMessage}`,
                returnDisplay: `Error listing markdown from memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryMarkdownList tool logic
 */
export class MemoryMarkdownListTool extends BaseDeclarativeTool<
    MemoryMarkdownListToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_markdown_list';

    constructor() {
        super(
            MemoryMarkdownListTool.Name,
            'MemoryMarkdownList',
            'Lists markdown content from memory storage. Optionally accepts filters to narrow down the results.',
            Kind.Read,
            {
                properties: {
                    filters: {
                        description: 'Optional filters to apply when listing markdown entries. The structure depends on the memory storage implementation.',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryMarkdownListToolParams,
    ): string | null {
        if (params.filters !== undefined && params.filters !== null) {
            if (typeof params.filters !== 'object' || Array.isArray(params.filters)) {
                return "The 'filters' parameter must be a JSON object.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: MemoryMarkdownListToolParams,
    ): ToolInvocation<MemoryMarkdownListToolParams, ToolResult> {
        return new MemoryMarkdownListToolInvocation(params);
    }
}
