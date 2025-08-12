/**
 * Notification Enums
 * 
 * This file contains all enums related to the notification system used across
 * the CodeBolt application. These enums define notification types, actions,
 * and response types for all notification modules.
 */

// ================================
// Notification Types
// ================================

/**
 * Main notification types used in the notification system
 * These correspond to the 'type' field in notification objects
 */
export enum NotificationEventType {
    AGENT_NOTIFY = "agentnotify",
    BROWSER_NOTIFY = "browsernotify", 
    CHAT_NOTIFY = "chatnotify",
    CODEUTILS_NOTIFY = "codeutilsnotify",
    CRAWLER_NOTIFY = "crawlernotify",
    DBMEMORY_NOTIFY = "dbmemorynotify",
    FS_NOTIFY = "fsnotify",
    GIT_NOTIFY = "gitnotify",
    HISTORY_NOTIFY = "historynotify",
    LLM_NOTIFY = "llmnotify",
    MCP_NOTIFY = "mcpnotify",
    SEARCH_NOTIFY = "searchnotify",
    TERMINAL_NOTIFY = "terminalnotify",
    TASK_NOTIFY = "tasknotify",
}

// ================================
// Agent Notification Actions
// ================================

export enum AgentNotificationAction {
    START_SUBAGENT_TASK_REQUEST = "startSubagentTaskRequest",
    START_SUBAGENT_TASK_RESULT = "startSubagentTaskResult", 
    SUBAGENT_TASK_COMPLETED = "subagentTaskCompleted",
}

// ================================
// Browser Notification Actions
// ================================

export enum BrowserNotificationAction {
    WEB_FETCH_REQUEST = "webFetchRequest",
    WEB_FETCH_RESULT = "webFetchResult",
    WEB_SEARCH_REQUEST = "webSearchRequest", 
    WEB_SEARCH_RESULT = "webSearchResult",
}

// ================================
// Chat Notification Actions
// ================================

export enum ChatNotificationAction {
    SEND_MESSAGE_REQUEST = "sendMessageRequest",
    AGENT_TEXT_RESPONSE = "agentTextResponse",
    GET_CHAT_HISTORY_REQUEST = "getChatHistoryRequest",
    GET_CHAT_HISTORY_RESULT = "getChatHistoryResult",
}

// ================================
// Code Utils Notification Actions
// ================================

export enum CodeUtilsNotificationAction {
    GREP_SEARCH_REQUEST = "grepSearchRequest",
    GREP_SEARCH_RESULT = "grepSearchResult", 
    GLOB_SEARCH_REQUEST = "globSearchRequest",
    GLOB_SEARCH_RESULT = "globSearchResult",
}

// ================================
// Crawler Notification Actions
// ================================

export enum CrawlerNotificationAction {
    CRAWLER_SEARCH_REQUEST = "crawlerSearchRequest",
    CRAWLER_SEARCH_RESULT = "crawlerSearchResult",
    CRAWLER_START_REQUEST = "crawlerStartRequest",
    CRAWLER_START_RESULT = "crawlerStartResult",
}

// ================================
// Database Memory Notification Actions
// ================================

export enum DbMemoryNotificationAction {
    ADD_KNOWLEDGE_REQUEST = "addKnowledgeRequest",
    ADD_KNOWLEDGE_RESULT = "addKnowledgeResult",
    GET_KNOWLEDGE_REQUEST = "getKnowledgeRequest", 
    GET_KNOWLEDGE_RESULT = "getKnowledgeResult",
}

// ================================
// File System Notification Actions
// ================================

export enum FsNotificationAction {
    CREATE_FILE_REQUEST = "createFileRequest",
    CREATE_FILE_RESULT = "createFileResult",
    CREATE_FOLDER_REQUEST = "createFolderRequest",
    CREATE_FOLDER_RESULT = "createFolderResult",
    READ_FILE_REQUEST = "readFileRequest",
    READ_FILE_RESULT = "readFileResult",
    UPDATE_FILE_REQUEST = "updateFileRequest",
    UPDATE_FILE_RESULT = "updateFileResult",
    DELETE_FILE_REQUEST = "deleteFileRequest",
    DELETE_FILE_RESULT = "deleteFileResult",
    DELETE_FOLDER_REQUEST = "deleteFolderRequest",
    DELETE_FOLDER_RESULT = "deleteFolderResult",
    LIST_DIRECTORY_REQUEST = "listDirectoryRequest",
    LIST_DIRECTORY_RESULT = "listDirectoryResult",
    WRITE_TO_FILE_REQUEST = "writeToFileRequest",
    WRITE_TO_FILE_RESULT = "writeToFileResult",
    APPEND_TO_FILE_REQUEST = "appendToFileRequest",
    APPEND_TO_FILE_RESULT = "appendToFileResult",
    COPY_FILE_REQUEST = "copyFileRequest",
    COPY_FILE_RESULT = "copyFileResult",
    MOVE_FILE_REQUEST = "moveFileRequest",
    MOVE_FILE_RESULT = "moveFileResult",
}

// ================================
// Git Notification Actions
// ================================

export enum GitNotificationAction {
    INIT_REQUEST = "initRequest",
    INIT_RESULT = "initResult",
    PULL_REQUEST = "pullRequest",
    PULL_RESULT = "pullResult",
    PUSH_REQUEST = "pushRequest",
    PUSH_RESULT = "pushResult",
    STATUS_REQUEST = "statusRequest",
    STATUS_RESULT = "statusResult",
    ADD_REQUEST = "addRequest",
    ADD_RESULT = "addResult",
    COMMIT_REQUEST = "commitRequest",
    COMMIT_RESULT = "commitResult",
    CHECKOUT_REQUEST = "checkoutRequest",
    CHECKOUT_RESULT = "checkoutResult",
    BRANCH_REQUEST = "branchRequest",
    BRANCH_RESULT = "branchResult",
    LOGS_REQUEST = "logsRequest",
    LOGS_RESULT = "logsResult",
    DIFF_REQUEST = "diffRequest",
    DIFF_RESULT = "diffResult",
    REMOTE_ADD_REQUEST = "remoteAddRequest",
    REMOTE_ADD_RESULT = "remoteAddResult",
    CLONE_REQUEST = "cloneRequest",
    CLONE_RESULT = "cloneResult",
}

// ================================
// History Notification Actions
// ================================

export enum HistoryNotificationAction {
    SUMMARIZE_ALL_REQUEST = "summarizeAllRequest",
    SUMMARIZE_ALL_RESULT = "summarizeAllResult",
    SUMMARIZE_REQUEST = "summarizeRequest",
    SUMMARIZE_RESULT = "summarizeResult",
}

// ================================
// LLM Notification Actions
// ================================

export enum LlmNotificationAction {
    INFERENCE_REQUEST = "inferenceRequest",
    INFERENCE_RESULT = "inferenceResult",
    GET_TOKEN_COUNT_REQUEST = "getTokenCountRequest",
    GET_TOKEN_COUNT_RESULT = "getTokenCountResult",
}

// ================================
// MCP Notification Actions
// ================================

export enum McpNotificationAction {
    GET_ENABLED_MCP_SERVERS_REQUEST = "getEnabledMCPServersRequest",
    GET_ENABLED_MCP_SERVERS_RESULT = "getEnabledMCPServersResult",
    LIST_TOOLS_FROM_MCP_SERVERS_REQUEST = "listToolsFromMCPServersRequest",
    LIST_TOOLS_FROM_MCP_SERVERS_RESULT = "listToolsFromMCPServersResult",
    GET_TOOLS_REQUEST = "getToolsRequest",
    GET_TOOLS_RESULT = "getToolsResult",
    EXECUTE_TOOL_REQUEST = "executeToolRequest",
    EXECUTE_TOOL_RESULT = "executeToolResult",
}

// ================================
// Search Notification Actions
// ================================

export enum SearchNotificationAction {
    SEARCH_INIT_REQUEST = "searchInitRequest",
    SEARCH_INIT_RESULT = "searchInitResult",
    SEARCH_REQUEST = "searchRequest",
    SEARCH_RESULT = "searchResult",
    GET_FIRST_LINK_REQUEST = "getFirstLinkRequest",
    GET_FIRST_LINK_RESULT = "getFirstLinkResult",
}

// ================================
// System Notification Actions
// ================================

export enum SystemNotificationAction {
    PROCESS_STARTED_REQUEST = "processStartedRequest",
    PROCESS_STOPPED_REQUEST = "processStoppedRequest",
}

// ================================
// Terminal Notification Actions
// ================================

export enum TerminalNotificationAction {
    EXECUTE_COMMAND_REQUEST = "executeCommandRequest",
    EXECUTE_COMMAND_RESULT = "executeCommandResult",
}

// ================================
// Task/Todo Notification Actions
// ================================

export enum TaskNotificationAction {
    ADD_TASK_REQUEST = "addTaskRequest",
    ADD_TASK_RESULT = "addTaskResult",
    GET_TASKS_REQUEST = "getTasksRequest",
    GET_TASKS_RESULT = "getTasksResult",
    UPDATE_TASK_REQUEST = "updateTaskRequest",
    UPDATE_TASK_RESULT = "updateTaskResult",
}

// ================================
// Combined Notification Actions (All Modules)
// ================================

/**
 * Union type of all notification actions across all modules
 * Useful for type checking and validation
 */
export type AllNotificationActions = 
    | AgentNotificationAction
    | BrowserNotificationAction
    | ChatNotificationAction
    | CodeUtilsNotificationAction
    | CrawlerNotificationAction
    | DbMemoryNotificationAction
    | FsNotificationAction
    | GitNotificationAction
    | HistoryNotificationAction
    | LlmNotificationAction
    | McpNotificationAction
    | SearchNotificationAction
    | SystemNotificationAction
    | TerminalNotificationAction
    | TaskNotificationAction;

// ================================
// Notification Response Types
// ================================

/**
 * Common notification response types used across modules
 */
export enum NotificationResponseType {
    // Request types
    REQUEST = "request",
    
    // Response/Result types
    RESULT = "result",
    RESPONSE = "response",
    
    // Status types
    SUCCESS = "success",
    ERROR = "error",
    COMPLETED = "completed",
    
    // Special types
    TEXT_RESPONSE = "textResponse",
    TASK_COMPLETED = "taskCompleted",
}

// ================================
// Notification Categories
// ================================

/**
 * High-level categorization of notification modules
 */
export enum NotificationCategory {
    AGENT = "agent",
    BROWSER = "browser", 
    CHAT = "chat",
    CODE_UTILS = "codeutils",
    CRAWLER = "crawler",
    DATABASE = "dbmemory",
    FILE_SYSTEM = "fs",
    GIT = "git",
    HISTORY = "history",
    LLM = "llm",
    MCP = "mcp",
    SEARCH = "search",
    SYSTEM = "system",
    TERMINAL = "terminal",
    TASK = "task",
}
