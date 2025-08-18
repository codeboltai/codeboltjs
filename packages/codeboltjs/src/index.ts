import Codebolt from './core/Codebolt';

// ================================
// Public API Types - Essential for Library Users
// ================================

// Core Library Function Types - PRIMARY TYPES USERS NEED
export type { 
    // Core Message and Tool Types
    Message, 
    ToolCall, 
    Tool, 
    UserMessage,
    LLMInferenceParams,
    APIResponse,
    CodeboltConfig,
    ProgressCallback,
    ErrorCallback,
    SuccessCallback,
    CompletionCallback,

    // OpenAI Compatible Types
    OpenAIMessage,
    OpenAITool,
    ConversationEntry,
    ToolResult,
    ToolDetails,
    UserMessageContent,
    CodeboltAPI,

    // File System API Types
    ReadFileOptions,
    WriteFileOptions,
    ListFilesOptions,
    SearchFilesOptions,
    GrepSearchOptions,

    // Browser API Types
    BrowserNavigationOptions,
    BrowserScreenshotOptions,
    BrowserElementSelector,

    // Terminal API Types
    TerminalExecuteOptions,

    // Git API Types
    // GitCommitOptions,
    // GitLogOptions,

    // LLM API Types
    LLMChatOptions,

    // Vector Database Types
    VectorAddOptions,
    VectorQueryOptions,

    // Agent Types
    AgentMessageHandler,
    AgentConfiguration,

    // Memory Types
    MemorySetOptions,
    MemoryGetOptions,

    // Task Types
    TaskCreateOptions,
    TaskUpdateOptions,

    // Code Analysis Types
    CodeAnalysisOptions,
    CodeParseOptions,

    // Debug Types
    DebugLogOptions,

    // Project Types
    ProjectInfo,

    // Crawler Types
    CrawlerOptions,

    // MCP Types
    MCPExecuteOptions,
    MCPConfigureOptions,

    // State Types
    StateUpdateOptions,

    // Chat Types
    ChatSendOptions,
    ChatHistoryOptions,

    // Notification Types
    NotificationOptions,

    // Utility Types
    PaginationOptions,
    FilterOptions,
    AsyncOperationOptions,
    APIEventMap
} from './types/libFunctionTypes';

// ================================
// Common Types - Useful for Users Working with API Responses
// ================================

export type {
    // Git Types (returned by git operations)
    GitFileStatus,
    StatusResult,
    CommitSummary,
    DiffResult,

    // Agent Types (for agent management)
    AgentFunction,
    AgentDetail,
    Agent,

    // Task Types (for task management)
    Task,

    // Vector Database Types (for vector operations)
    VectorItem,
    VectorQueryResult,

    // File System Types (for file operations)
    FileEntry,
    SearchMatch,
    SearchResult,

    // Browser Types (for browser operations)
    BrowserElement,

    // Code Types (for code analysis)
    CodeIssue,
    CodeAnalysis,
    CodeMatcher,

    // MCP Types (for MCP management)
    MCPTool,
    MCPServer,

    // AST Types (for code parsing)
    ASTNode,

    // Notification Types (for notifications)
    Notification,

    // Utility Types for User Functions
    DeepPartial,
    DeepRequired,
    Optional,
    Required
} from './types/commonTypes';

// ================================
// Main Library Instance
// ================================

const codebolt = new Codebolt();

// ================================
// Export the Main Instance and Class
// ================================

// For ES6 modules (import)
export default codebolt;

// Export the class itself for advanced users who want to create custom instances
export { Codebolt };

// For CommonJS compatibility (require)
module.exports = codebolt;
module.exports.default = codebolt;
module.exports.Codebolt = Codebolt;



