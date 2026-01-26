/**
 * Search tools
 */

export { GlobTool, type GlobToolParams } from './glob';
export { GrepTool, type GrepToolParams } from './grep';
export { SearchFilesTool, type SearchFilesToolParams } from './search-files';
export { CodebaseSearchTool, type CodebaseSearchToolParams } from './codebase-search';
export { SearchMcpToolTool, type SearchMcpToolToolParams } from './search-mcp-tool';
export { ListCodeDefinitionNamesTool, type ListCodeDefinitionNamesToolParams } from './list-code-definition-names';

// Create instances for convenience
import { GlobTool } from './glob';
import { GrepTool } from './grep';
import { SearchFilesTool } from './search-files';
import { CodebaseSearchTool } from './codebase-search';
import { SearchMcpToolTool } from './search-mcp-tool';
import { ListCodeDefinitionNamesTool } from './list-code-definition-names';

/**
 * All search tools
 */
export const searchTools = [
    new GlobTool(),
    new GrepTool(),
    new SearchFilesTool(),
    new CodebaseSearchTool(),
    new SearchMcpToolTool(),
    new ListCodeDefinitionNamesTool(),
];
