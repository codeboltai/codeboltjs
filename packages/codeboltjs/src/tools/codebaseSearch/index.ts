/**
 * Codebase Search Tools
 * 
 * Tools for semantic code search across the project.
 */

export { CodebaseSearchTool } from './codebase-search';
export { CodebaseSearchMcpToolTool } from './codebase-search-mcp-tool';

import { CodebaseSearchTool } from './codebase-search';
import { CodebaseSearchMcpToolTool } from './codebase-search-mcp-tool';

/**
 * Array of all codebase search tools
 */
export const codebaseSearchTools = [
    new CodebaseSearchTool(),
    new CodebaseSearchMcpToolTool(),
];
