import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    CodebaseSearchOptions,
    SearchMcpToolOptions,
    CodebaseSearchResponse,
    McpToolSearchResponse
} from '../types/codebaseSearch';

/**
 * Codebase Search Module for codeboltjs
 * Provides semantic code search functionality across the project.
 * Mirrors the codebaseSearch.cli.ts operations via WebSocket.
 */
const codeboltCodebaseSearch = {
    /**
     * Perform a semantic search across the codebase
     * @param query - The search query
     * @param targetDirectories - Optional directories to limit the search
     */
    search: async (query: string, targetDirectories?: string[]): Promise<CodebaseSearchResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codebaseSearchEvent',
                action: 'codebase_search',
                requestId,
                message: { query, target_directories: targetDirectories }
            },
            'codebaseSearchResponse'
        );
    },

    /**
     * Search for MCP tools by query and optional tags
     * @param query - The search query
     * @param tags - Optional tags to filter results
     */
    searchMcpTool: async (query: string, tags?: string[]): Promise<McpToolSearchResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codebaseSearchEvent',
                action: 'search_mcp_tool',
                requestId,
                message: { query, tags }
            },
            'mcpToolSearchResponse'
        );
    }
};

export default codeboltCodebaseSearch;
