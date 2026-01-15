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

// Response from codebase search
export interface CodebaseSearchResponse {
    success: boolean;
    results: CodeSearchResult[];
    message?: string;
}

// Response from MCP tool search
export interface McpToolSearchResponse {
    success: boolean;
    results: any[];
    message?: string;
}
