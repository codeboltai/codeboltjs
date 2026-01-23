/**
 * Codebolt Tools - LLM-ready tool definitions that wrap SDK APIs
 *
 * This module provides tools in OpenAI-compatible format that can be used
 * with LLMs for agentic workflows. Each tool wraps underlying SDK functionality.
 */

// Export types
export * from './types';

// Export base classes
export {
    BaseToolInvocation,
    DeclarativeTool,
    BaseDeclarativeTool,
    Kind,
    type ToolInvocation,
    type ToolResult,
    type ToolLocation,
    type ToolCallConfirmationDetails,
} from './base-tool';

// Export registry
export { ToolRegistry, defaultRegistry } from './registry';

// Export utilities
export * from './utils';

// Export file tools
export {
    ReadFileTool,
    WriteFileTool,
    EditTool,
    ListDirectoryTool,
    ReadManyFilesTool,
    fileTools,
    type ReadFileToolParams,
    type WriteFileToolParams,
    type EditToolParams,
    type ListDirectoryToolParams,
    type ReadManyFilesToolParams,
} from './file';

// Export search tools
export {
    GlobTool,
    GrepTool,
    SearchFilesTool,
    CodebaseSearchTool,
    SearchMcpToolTool,
    ListCodeDefinitionNamesTool,
    searchTools,
    type GlobToolParams,
    type GrepToolParams,
    type SearchFilesToolParams,
    type CodebaseSearchToolParams,
    type SearchMcpToolToolParams,
    type ListCodeDefinitionNamesToolParams,
} from './search';

// Export terminal tools
export {
    ExecuteCommandTool,
    terminalTools,
    type ExecuteCommandToolParams,
} from './terminal';

// Export git tools (individual tools)
export {
    GitInitTool,
    GitStatusTool,
    GitAddTool,
    GitCommitTool,
    GitPushTool,
    GitPullTool,
    GitCheckoutTool,
    GitBranchTool,
    GitLogsTool,
    GitDiffTool,
    GitCloneTool,
    gitTools,
    type GitInitParams,
    type GitStatusParams,
    type GitAddParams,
    type GitCommitParams,
    type GitPushParams,
    type GitPullParams,
    type GitCheckoutParams,
    type GitBranchParams,
    type GitLogsParams,
    type GitDiffParams,
    type GitCloneParams,
} from './git';

// Export browser tools (individual tools)
export {
    BrowserNavigateTool,
    BrowserScreenshotTool,
    BrowserClickTool,
    BrowserTypeTool,
    BrowserScrollTool,
    BrowserGetContentTool,
    BrowserGetHtmlTool,
    BrowserGetMarkdownTool,
    BrowserGetUrlTool,
    BrowserCloseTool,
    BrowserEnterTool,
    BrowserSearchTool,
    browserTools,
    type BrowserNavigateParams,
    type BrowserScreenshotParams,
    type BrowserClickParams,
    type BrowserTypeParams,
    type BrowserScrollParams,
    type BrowserGetContentParams,
    type BrowserGetHtmlParams,
    type BrowserGetMarkdownParams,
    type BrowserGetUrlParams,
    type BrowserCloseParams,
    type BrowserEnterParams,
    type BrowserSearchParams,
} from './browser';

// Export orchestration tools (individual tools)
export {
    TaskCreateTool,
    TaskUpdateTool,
    TaskDeleteTool,
    TaskListTool,
    TaskGetTool,
    TaskAssignTool,
    TaskExecuteTool,
    AgentFindTool,
    AgentStartTool,
    AgentListTool,
    AgentDetailsTool,
    orchestrationTools,
    type TaskCreateParams,
    type TaskUpdateParams,
    type TaskDeleteParams,
    type TaskListParams,
    type TaskGetParams,
    type TaskAssignParams,
    type TaskExecuteParams,
    type AgentFindParams,
    type AgentStartParams,
    type AgentListParams,
    type AgentDetailsParams,
} from './orchestration';

// Import all tool arrays
import { fileTools } from './file';
import { searchTools } from './search';
import { terminalTools } from './terminal';
import { gitTools } from './git';
import { browserTools } from './browser';
import { orchestrationTools } from './orchestration';
import { ToolRegistry } from './registry';

/**
 * All available tools combined
 */
export const allTools = [
    ...fileTools,
    ...searchTools,
    ...terminalTools,
    ...gitTools,
    ...browserTools,
    ...orchestrationTools,
];

/**
 * Create and populate the default tools registry
 */
const toolsRegistry = new ToolRegistry();
toolsRegistry.registerTools(allTools);

/**
 * Tools module providing LLM-ready tool definitions
 */
const tools = {
    /**
     * Get all available tools
     */
    getAllTools: () => allTools,

    /**
     * Get the tool registry
     */
    getRegistry: () => toolsRegistry,

    /**
     * Get OpenAI-compatible tool schemas for all tools
     */
    getToolSchemas: () => toolsRegistry.getToolSchemas(),

    /**
     * Get function call schemas for all tools
     */
    getFunctionCallSchemas: () => toolsRegistry.getFunctionCallSchemas(),

    /**
     * Execute a tool by name
     */
    executeTool: async (
        name: string,
        params: object,
        signal?: AbortSignal,
        updateOutput?: (output: string) => void,
    ) => toolsRegistry.executeTool(name, params, signal, updateOutput),

    /**
     * Get a specific tool by name
     */
    getTool: (name: string) => toolsRegistry.getTool(name),

    /**
     * Check if a tool exists
     */
    hasTool: (name: string) => toolsRegistry.hasTool(name),

    /**
     * Get tool names
     */
    getToolNames: () => toolsRegistry.getToolNames(),

    // Tool categories for convenience
    file: fileTools,
    search: searchTools,
    terminal: terminalTools,
    git: gitTools,
    browser: browserTools,
    orchestration: orchestrationTools,
};

export default tools;
