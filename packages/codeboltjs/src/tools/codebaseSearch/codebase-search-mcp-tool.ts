/**
 * Codebase Search MCP Tool
 * 
 * Searches for MCP tools by query and optional tags.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodebaseSearch from '../../modules/codebaseSearch';

/**
 * Parameters for MCP tool search
 */
export interface CodebaseSearchMcpToolParams {
    /** The search query */
    query: string;
    /** Optional tags to filter results */
    tags?: string[];
}

class CodebaseSearchMcpToolInvocation extends BaseToolInvocation<CodebaseSearchMcpToolParams, ToolResult> {
    constructor(params: CodebaseSearchMcpToolParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodebaseSearch.searchMcpTool(
                this.params.query,
                this.params.tags
            );

            const tools = response.results;

            if (!tools) {
                return {
                    llmContent: 'Error: Failed to search MCP tools - no tools returned',
                    returnDisplay: 'Error: Failed to search MCP tools',
                    error: {
                        message: 'No tools returned from search operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const tagInfo = this.params.tags 
                ? ` with tags: ${this.params.tags.join(', ')}` 
                : '';
            return {
                llmContent: `Found ${tools.length} MCP tools for query "${this.params.query}"${tagInfo}`,
                returnDisplay: `Found ${tools.length} MCP tools`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for searching MCP tools
 */
export class CodebaseSearchMcpToolTool extends BaseDeclarativeTool<CodebaseSearchMcpToolParams, ToolResult> {
    constructor() {
        super(
            'codebase_search_mcp_tool',
            'Search MCP Tools',
            'Searches for MCP tools by query with optional tag filtering.',
            Kind.Search,
            {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query',
                    },
                    tags: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional tags to filter results',
                    },
                },
                required: ['query'],
            }
        );
    }

    protected override createInvocation(params: CodebaseSearchMcpToolParams): ToolInvocation<CodebaseSearchMcpToolParams, ToolResult> {
        return new CodebaseSearchMcpToolInvocation(params);
    }
}
