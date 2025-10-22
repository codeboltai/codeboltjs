/**
 * Search MCP Tool - Searches for MCP tools based on instructions
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';

/**
 * Parameters for the SearchMcpTool tool
 */
export interface SearchMcpToolParams {
    /**
     * The search query for MCP tools
     */
    query: string;

    /**
     * Optional tags to filter by
     */
    tags?: string[];
}

class SearchMcpToolInvocation extends BaseToolInvocation<
    SearchMcpToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: SearchMcpToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        const tags = this.params.tags ? ` with tags: ${this.params.tags.join(', ')}` : '';
        return `Searching MCP tools for: ${this.params.query}${tags}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import handleSearchMcpTool to use existing logic
            const { handleSearchMcpTool } = await import('../../cliLib/mcpService.cli');

            // Create finalMessage object similar to mcpService.cli.ts
            const finalMessage = {
                threadId: 'codebolt-tools',
                agentInstanceId: 'codebolt-tools',
                agentId: 'codebolt-tools',
                parentAgentInstanceId: 'codebolt-tools',
                parentId: 'codebolt-tools'
            };

            // Use the exact same logic as mcpService.cli.ts
            const result = await handleSearchMcpTool(this.params, finalMessage);

            if (result && typeof result === 'object') {
                // Success case - result is an object
                return {
                    llmContent: JSON.stringify(result, null, 2),
                    returnDisplay: JSON.stringify(result, null, 2)
                };
            } else if (result && result[0] === false) {
                // Success case - result is a tuple
                return {
                    llmContent: result[1] || 'MCP tool search completed',
                    returnDisplay: result[1] || 'MCP tool search completed'
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.MCP_TOOL_ERROR,
                        message: (result && result[1]) || 'MCP tool search failed'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.MCP_TOOL_ERROR,
                    message: `Failed to search MCP tools: ${error.message || error}`
                }
            };
        }
    }
}

export class SearchMcpToolTool extends BaseDeclarativeTool<
    SearchMcpToolParams,
    ToolResult
> {
    static readonly Name: string = 'search_mcp_tool';

    constructor(private readonly config: ConfigManager) {
        super(
            SearchMcpToolTool.Name,
            'Search MCP Tool',
            'Search for MCP tools in the database based on instructions or keywords. Use this to find tools that match specific functionality needs or requirements.',
            Kind.Search,
            {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query to find relevant MCP tools. Can be keywords, functionality description, or specific requirements.'
                    },
                    tags: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: 'Optional array of tags to filter MCP tools by specific categories or capabilities.'
                    }
                },
                required: ['query']
            }
        );
    }

    protected override validateToolParamValues(
        params: SearchMcpToolParams,
    ): string | null {
        if (!params.query || params.query.trim() === '') {
            return 'Parameter "query" must be a non-empty string.';
        }
        return null;
    }

    protected createInvocation(params: SearchMcpToolParams) {
        return new SearchMcpToolInvocation(this.config, params);
    }
}
