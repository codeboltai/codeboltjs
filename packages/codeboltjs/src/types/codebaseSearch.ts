// Codebase Search Types for codeboltjs

// Search result item
export interface CodeSearchResult {
    file: string;
    content: string;
    language: string;
    startLine?: number;
    endLine?: number;
    score?: number;
}

// Search options for codebase search
export interface CodebaseSearchOptions {
    query: string;
    target_directories?: string[];
}

// Search options for MCP tool search
export interface SearchMcpToolOptions {
    query: string;
    tags?: string[];
}

// Response from codebase search - data returned directly, no payload wrapper
export interface CodebaseSearchResponse {
    type?: string;
    success: boolean;
    message?: string;
    results?: CodeSearchResult[];
    timestamp?: string;
    requestId?: string;
}

// Response from MCP tool search - data returned directly, no payload wrapper
export interface McpToolSearchResponse {
    type?: string;
    success: boolean;
    message?: string;
    results?: any[];
    timestamp?: string;
    requestId?: string;
}
