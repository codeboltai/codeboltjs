/**
 * Codebolt Types - Essential type exports for the codeboltjs library
 * 
 * This file provides easy access to all user-facing types exported by the library.
 * Users can import types from here for better organization.
 * 
 * Usage:
 * ```typescript
 * import type { Message, ToolCall, APIResponse } from 'codeboltjs/types';
 * // or
 * import type { LLMChatOptions, BrowserScreenshotOptions } from 'codeboltjs/types';
 * ```
 */

// ================================
// Core Library Function Types
// ================================

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
    AddSubTaskOptions,
    UpdateSubTaskOptions,
    TaskFilterOptions,
    TaskMarkdownImportOptions,
    TaskMarkdownExportOptions,

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
} from './libFunctionTypes';

// ================================
// Common Types - API Response Types
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
    SubTask,
    TaskResponse,

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
} from './commonTypes'; 

// ================================
// Job Types - Job management
// ================================
export type {
    Job,
    JobGroup,
    JobStatus,
    JobType,
    JobPriority,
    DependencyType,
    JobDependency,
    JobListFilters,
    CreateJobData,
    UpdateJobData,
    CreateJobGroupData,
    JobShowResponse,
    JobListResponse,
    JobUpdateResponse,
    JobCreateResponse,
    JobDeleteResponse,
    JobDeleteBulkResponse,
    JobDependencyResponse,
    JobReadyBlockedResponse,
    JobLabelsResponse,
    JobGroupCreateResponse
} from './job';