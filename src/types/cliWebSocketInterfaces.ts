/**
 * Comprehensive TypeScript interfaces for CLI WebSocket responses
 * Generated from analysis of all CLI service files in /src/main/server/cliLib/
 * 
 * This file provides complete type safety for all WebSocket responses from CLI services:
 * - File System Operations (fsService.cli.ts)
 * - Browser Operations (browserService.ts) 
 * - Terminal Operations (terminalService.cli.ts)
 * - Git Operations (gitService.cli.ts)
 * - Memory Operations (memoryService.cli.ts)
 * - Task Operations (taskService.cli.ts)
 * - Vector Database Operations (vectordbService.cli.ts)
 * - Debug Operations (debugService.cli.ts)
 * - Code Utils Operations (codeUtilsService.cli.ts)
 * - Agent Operations (agentService.cli.ts)
 * - App/State Operations (appServerice.cli.ts & stateService.cli.ts)
 * - Chat/Message Operations (messageService.cli.ts & chatHistory.cli.ts)
 * - Crawler Operations (crawlerService.cli.ts)
 * - MCP Tool Operations (mcpService.cli.ts)
 * - Notification Operations (notificationService.cli.ts)
 */

// ================================
// Base Interfaces
// ================================

export interface BaseWebSocketResponse {
  type: string;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  messageId?: string;
  threadId?: string;
}

export interface BaseExecuteToolResponse extends BaseWebSocketResponse {
  result?: any;
  status?: 'pending' | 'executing' | 'success' | 'error' | 'rejected';
}

// ================================
// File System Service Response Interfaces (fsService.cli.ts)
// ================================

/**
 * Complete TypeScript interfaces for all fsService.cli.ts WebSocket responses
 * 
 * This section defines comprehensive types for all file system operations available in fsService:
 * 
 * 1. READ OPERATIONS:
 *    - FsReadFileResponse: Read file content with confirmation flow
 *    - FsListFilesResponse: List files/directories (recursive option)
 *    - FsListCodeDefinitionsResponse: Parse and list code definitions
 *    - FsSearchFilesResponse: Search files with regex patterns
 *    - FsGrepSearchResponse: Ripgrep-powered search with filters
 *    - FsFileSearchResponse: Fuzzy file name search
 * 
 * 2. WRITE OPERATIONS:
 *    - FsWriteToFileResponse: Write content to files with review mode
 *    - FsCreateFileResponse: Create new files
 *    - FsCreateFolderResponse: Create directories
 *    - FsUpdateFileResponse: Update existing files
 *    - FsEditFileAndApplyDiffResponse: AI-assisted file editing with diffs
 * 
 * 3. DELETE OPERATIONS:
 *    - FsDeleteFileResponse: Delete files
 *    - FsDeleteFolderResponse: Delete directories
 * 
 * 4. TOOL EXECUTION:
 *    - FsExecuteToolResponse: Execute file system tools with confirmation
 *    - FileStateInfo: UI state management for confirmation dialogs
 * 
 * All responses include:
 * - success: boolean flag for operation status
 * - result: string with formatted output or error message
 * - path: file/directory path being operated on
 * - UI state management for confirmation flows
 * - Error handling with detailed messages
 * 
 * Key Features:
 * - Permission system with confirmation dialogs
 * - Review mode for file changes
 * - Cache invalidation for file operations
 * - Monaco editor integration
 * - Support for various file encodings
 * - Comprehensive error handling
 */

/**
 * Base interface for all file system operations
 */
export interface BaseFsResponse extends BaseWebSocketResponse {
  path?: string;
  success: boolean;
}

/**
 * Response from readFile operation
 */
export interface FsReadFileResponse extends BaseFsResponse {
  type: 'readFileResponse';
  content?: string;
  encoding?: string;
  result?: string; // File content or error message
}

/**
 * Response from writeToFile operation
 */
export interface FsWriteToFileResponse extends BaseFsResponse {
  type: 'writeToFileResponse';
  result?: string; // Success message or error
  bytesWritten?: number;
}

/**
 * Response from listFiles operation
 */
export interface FsListFilesResponse extends BaseFsResponse {
  type: 'fileListResponse';
  files?: string[];
  result?: string; // Formatted file list or error
  isRecursive?: boolean;
}

/**
 * Response from listCodeDefinitionNames operation
 */
export interface FsListCodeDefinitionsResponse extends BaseFsResponse {
  type: 'listCodeDefinitionNamesResponse';
  definitions?: string[];
  result?: string; // Code definitions or error
}

/**
 * Response from searchFiles operation
 */
export interface FsSearchFilesResponse extends BaseFsResponse {
  type: 'searchFilesResponse';
  query?: string;
  results?: Array<{
    path: string;
    matches: Array<{
      line: number;
      content: string;
      lineNumber: number;
    }>;
  }>;
  result?: string; // Search results or error
  filePattern?: string;
}

/**
 * Response from grepSearch operation
 */
export interface FsGrepSearchResponse extends BaseFsResponse {
  type: 'grepSearchResponse';
  query?: string;
  includePattern?: string;
  excludePattern?: string;
  caseSensitive?: boolean;
  results?: Array<{
    file: string;
    line: number;
    content: string;
    match: string;
  }>;
  result?: string; // Grep results or error
}

/**
 * Response from fileSearch (fuzzy search) operation
 */
export interface FsFileSearchResponse extends BaseFsResponse {
  type: 'fileSearchResponse';
  query?: string;
  results?: string[]; // Array of matching file paths
  result?: string; // Formatted results or error
}

/**
 * Response from createFile operation
 */
export interface FsCreateFileResponse extends BaseFsResponse {
  type: 'createFileResponse';
  fileName?: string;
  source?: string;
}

/**
 * Response from createFolder operation
 */
export interface FsCreateFolderResponse extends BaseFsResponse {
  type: 'createFolderResponse';
  folderName?: string;
}

/**
 * Response from updateFile operation
 */
export interface FsUpdateFileResponse extends BaseFsResponse {
  type: 'updateFileResponse';
  newContent?: string;
  bytesWritten?: number;
}

/**
 * Response from deleteFile operation
 */
export interface FsDeleteFileResponse extends BaseFsResponse {
  type: 'deleteFileResponse';
  filename?: string;
}

/**
 * Response from deleteFolder operation
 */
export interface FsDeleteFolderResponse extends BaseFsResponse {
  type: 'deleteFolderResponse';
  foldername?: string;
}

/**
 * Response from editFileAndApplyDiff operation
 */
export interface FsEditFileAndApplyDiffResponse extends BaseFsResponse {
  type: 'editFileAndApplyDiffResponse';
  filePath?: string;
  diff?: string;
  diffIdentifier?: string;
  prompt?: string;
  applyModel?: string;
  result?: string | {
    status: 'success' | 'error' | 'review_started' | 'rejected';
    file: string;
    message: string;
  };
}

/**
 * File state information for UI updates
 */
export interface FileStateInfo {
  type: 'file' | 'folder' | 'search' | 'fileSearch' | 'mcp';
  path?: string;
  content?: string | string[];
  query?: string;
  stateEvent: 'ASK_FOR_CONFIRMATION' | 'FILE_READ' | 'FILE_READ_ERROR' | 'REJECTED' | 'SEARCHING' | 
              'ASK_FOR_CONFIRMATION' | 'APPLYING_EDIT' | 'EDIT_STARTING' | 'FILE_WRITE' | 'FILE_WRITE_ERROR';
  originalContent?: string;
  results?: any[];
  includePattern?: string;
  excludePattern?: string;
  caseSensitive?: boolean;
  toolName?: string;
  serverName?: string;
  params?: any;
}

/**
 * Execute tool response for file system operations
 */
export interface FsExecuteToolResponse extends BaseExecuteToolResponse {
  type: 'fsExecuteToolResponse';
  toolName?: 'read_file' | 'write_file' | 'list_files' | 'list_code_definitions' | 
             'search_files' | 'grep_search' | 'edit_file';
  params?: {
    path?: string;
    content?: string;
    isRecursive?: string | boolean;
    askForPermission?: boolean;
    regex?: string;
    filePattern?: string;
    query?: string;
    includePattern?: string;
    excludePattern?: string;
    caseSensitive?: boolean;
    target_file?: string;
    code_edit?: string;
    diffIdentifier?: string;
    prompt?: string;
    applyModel?: string;
  };
  data?: [boolean, string] | { success: boolean; data?: any; error?: string };
}

// ================================
// Terminal Command Types (for terminal.ts)
// ================================

export interface CommandError extends BaseWebSocketResponse {
  type: 'commandError';
  error: string;
  exitCode?: number;
  stderr?: string;
}

export interface CommandFinish extends BaseWebSocketResponse {
  type: 'commandFinish';
  exitCode: number;
  stdout?: string;
  stderr?: string;
}

export interface CommandOutput extends BaseWebSocketResponse {
  type: 'commandOutput';
  output: string;
  stdout?: string;
  stderr?: string;
}

export interface TerminalInterruptResponse {
  type: 'terminalInterrupted';
  success: boolean;
  message?: string;
}

export interface TerminalInterrupted extends BaseWebSocketResponse {
  type: 'terminalInterrupted';
  interrupted: boolean;
}

// ================================
// Chat Message Types (for chat.ts)
// ================================

export interface ChatMessage extends BaseWebSocketResponse {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: string;
  role?: 'user' | 'assistant' | 'system';
  metadata?: Record<string, any>;
}

export interface UserMessage {
  type: "messageResponse";
  message: {
    type: "messageResponse";
    userMessage: string;
    currentFile: string;
    selectedAgent: {
      id: string;
      name: string;
      lastMessage: Record<string, any>;
    };
    mentionedFiles: string[];
    mentionedFullPaths: string[];
    mentionedFolders: string[];
    mentionedMultiFile: string[];
    mentionedMCPs: string[];
    uploadedImages: string[];
    actions: any[];
    mentionedAgents: any[];
    mentionedDocs: any[];
    links: any[];
    universalAgentLastMessage: string;
    selection: any | null;
    controlFiles: any[];
    feedbackMessage: string;
    terminalMessage: string;
    messageId: string;
    threadId: string;
    templateType: string;
    processId: string;
    shadowGitHash: string;
  };
  sender: {
    senderType: string;
    senderInfo: Record<string, any>;
  };
  templateType: string;
  data: {
    text: string;
    [key: string]: any;
  };
  messageId: string;
  timestamp: string;
}


export interface ChatMessageFromUser {
    type: "messageResponse";
    userMessage: string;
    currentFile: string;
    selectedAgent: {
      id: string;
      name: string;
      lastMessage: Record<string, any>;
    };
    mentionedFiles: string[];
    mentionedFullPaths: string[];
    mentionedFolders: string[];
    mentionedMultiFile: string[];
    mentionedMCPs: string[];
    uploadedImages: string[];
    actions: any[];
    mentionedAgents: any[];
    mentionedDocs: any[];
    links: any[];
    universalAgentLastMessage: string;
    selection: any | null;
    controlFiles: any[];
    feedbackMessage: string;
    terminalMessage: string;
    messageId: string;
    threadId: string;
    templateType: string;
    processId: string;
    shadowGitHash: string;
  }

// ================================
// LLM Types (for llm.ts)
// ================================

export interface LLMResponse extends BaseWebSocketResponse {
  type: 'llmResponse';
  content: string;
  role: 'assistant';
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason?: string;
  choices?: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

// ================================
// Token Types (for tokenizer.ts)
// ================================

export interface AddTokenResponse extends BaseWebSocketResponse {
  type: 'addTokenResponse';
  token?: string;
  count?: number;
}

export interface GetTokenResponse extends BaseWebSocketResponse {
  type: 'getTokenResponse';
  tokens?: string[];
  count?: number;
}

// ================================
// Code Utils Types (for codeutils.ts)
// ================================

export interface GetMatcherListTreeResponse extends BaseWebSocketResponse {
  type: 'getMatcherListTreeResponse';
  matchers?: Array<{
    name: string;
    description: string;
    language: string;
    pattern: string;
  }>;
}

export interface getMatchDetail extends BaseWebSocketResponse {
  type: 'getMatchDetailResponse';
  matcher?: {
    name: string;
    description: string;
    language: string;
    pattern: string;
    examples?: string[];
  };
}

// ================================
// Project Types (for project.ts)
// ================================

export interface GetProjectPathResponse extends BaseWebSocketResponse {
  type: 'getProjectPathResponse';
  projectPath?: string;
  projectName?: string;
}

// ================================
// File System Types (Additional for fs.ts)
// ================================

export interface CreateFolderResponse extends BaseWebSocketResponse {
  type: 'createFolderResponse';
  path?: string;
}

export interface UpdateFileResponse extends BaseWebSocketResponse {
  type: 'updateFileResponse';
  path?: string;
  bytesWritten?: number;
}

export interface DeleteFolderResponse extends BaseWebSocketResponse {
  type: 'deleteFolderResponse';
  path?: string;
}

// ================================
// Browser Types (Additional for browser.ts)
// ================================

export interface GoToPageResponse extends BaseWebSocketResponse {
  type: 'goToPageResponse';
  url?: string;
  success?: boolean;
}

export interface UrlResponse extends BaseWebSocketResponse {
  type: 'urlResponse';
  url?: string;
  currentUrl?: string;
}

export interface GetMarkdownResponse extends BaseWebSocketResponse {
  type: 'getMarkdownResponse';
  markdown?: string;
  content?: string;
}

export interface HtmlReceived extends BaseWebSocketResponse {
  type: 'htmlReceived';
  html?: string;
  content?: string;
}

export interface ExtractTextResponse extends BaseWebSocketResponse {
  type: 'extractTextResponse';
  text?: string;
  content?: string;
}

export interface GetContentResponse extends BaseWebSocketResponse {
  type: 'getContentResponse';
  content?: string;
  html?: string;
  text?: string;
}

// ================================
// Application State Types (for state.ts)
// ================================

export interface ApplicationState {
  currentProject?: string;
  workingDirectory?: string;
  openFiles?: string[];
  recentProjects?: string[];
  userPreferences?: Record<string, any>;
  sessionData?: Record<string, any>;
}

// ================================
// Git Status & Related Types (from simple-git)
// ================================

export interface GitFileStatus {
  path: string;
  index: string;
  working_dir: string;
}

export interface StatusResult {
  not_added: string[];
  conflicted: string[];
  created: string[];
  deleted: string[];
  modified: string[];
  renamed: string[];
  files: GitFileStatus[];
  staged: string[];
  ahead: number;
  behind: number;
  current: string | null;
  tracking: string | null;
  detached: boolean;
}

export interface CommitSummary {
  hash: string;
  date: string;
  message: string;
  refs: string;
  body: string;
  author_name: string;
  author_email: string;
}

export interface DiffResult {
  files: Array<{
    file: string;
    changes: number;
    insertions: number;
    deletions: number;
    binary: boolean;
  }>;
  insertions: number;
  deletions: number;
  changed: number;
}

// ================================
// Browser Response Types
// ================================

export interface BrowserViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
  pageYOffset: number;
  pageXOffset: number;
  windowWidth: number;
  windowHeight: number;
  offsetHeight: number;
  scrollHeight: number;
}

export interface BrowserSnapshot {
  tree: {
    strings: string[];
    documents: Array<{
      nodes: {
        backendNodeId: number[];
        attributes: Array<{ name: string; value: string }>;
        nodeValue: string[];
        parentIndex: number[];
        nodeType: number[];
        nodeName: string[];
        isClickable: { index: number[] };
        textValue: { index: number[]; value: string[] };
        inputValue: { index: number[]; value: string[] };
        inputChecked: { index: number[] };
      };
    }>;
  };
}

export interface BrowserActionResponsePayload {
  action?: string;
  success?: boolean;
  content?: string;
  html?: string;
  markdown?: string;
  text?: string;
  url?: string;
  viewport?: BrowserViewportInfo;
  info?: BrowserViewportInfo;
  tree?: BrowserSnapshot['tree'];
  screenshot?: string; // base64 image data
  pdf?: Buffer | string;
  elements?: Array<{
    id: string;
    tag: string;
    text: string;
    attributes: Record<string, string>;
  }>;
  selector?: string;
  fullPage?: boolean;
  options?: Record<string, any>;
}

// ================================
// Agent Response Types
// ================================

export interface AgentFunction {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
      }>;
      required?: string[];
      additionalProperties?: boolean;
    };
    strict?: boolean;
  };
}

export interface AgentDetail {
  id: string;
  name: string;
  description: string;
  capabilities?: string[];
  isLocal: boolean;
  version: string;
  status: string;
  unique_id: string;
}

// ================================
// Task Response Types
// ================================

export interface Task {
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
}

// ================================
// Vector Database Types
// ================================

export interface VectorItem {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  content?: string;
}

export interface VectorQueryResult {
  items: VectorItem[];
  scores?: number[];
  distances?: number[];
}

// ================================
// File System Response Interfaces
// ================================

export interface ReadFileResponse extends BaseWebSocketResponse {
  type: 'readFileResponse';
  content?: string;
  path?: string;
  encoding?: string;
}

export interface CreateFileResponse extends BaseWebSocketResponse {
  type: 'createFileResponse';
  path?: string;
}

export interface WriteToFileResponse extends BaseWebSocketResponse {
  type: 'writeToFileResponse';
  path?: string;
  bytesWritten?: number;
}

export interface DeleteFileResponse extends BaseWebSocketResponse {
  type: 'deleteFileResponse';
  path?: string;
}

export interface ListDirectoryResponse extends BaseWebSocketResponse {
  type: 'listDirectoryResponse';
  path?: string;
  files?: string[];
  directories?: string[];
  entries?: Array<{
    name: string;
    isDirectory: boolean;
    size?: number;
    modified?: string;
  }>;
}

export interface CreateDirectoryResponse extends BaseWebSocketResponse {
  type: 'createDirectoryResponse';
  path?: string;
}

export interface SearchFilesResponse extends BaseWebSocketResponse {
  type: 'searchFilesResponse';
  query?: string;
  results?: Array<{
    path: string;
    matches: Array<{
      line: number;
      content: string;
      lineNumber: number;
    }>;
  }>;
}

export interface GetFileInfoResponse extends BaseWebSocketResponse {
  type: 'getFileInfoResponse';
  path?: string;
  size?: number;
  modified?: string;
  created?: string;
  isDirectory?: boolean;
  permissions?: string;
}

export interface MoveFileResponse extends BaseWebSocketResponse {
  type: 'moveFileResponse';
  from?: string;
  to?: string;
}

export interface CopyFileResponse extends BaseWebSocketResponse {
  type: 'copyFileResponse';
  from?: string;
  to?: string;
}

export interface GetWorkingDirectoryResponse extends BaseWebSocketResponse {
  type: 'getWorkingDirectoryResponse';
  path?: string;
}

export interface WatchFileResponse extends BaseWebSocketResponse {
  type: 'watchFileResponse';
  path?: string;
  event?: 'change' | 'add' | 'unlink';
}

// ================================
// Browser Response Interfaces
// ================================

export interface BrowserActionResponseData extends BaseWebSocketResponse {
  type: 'browserActionResponse' | 'screenshotResponse' | 'getContentResponse' | 'getMarkdownResponse' | 'getBrowserInfoResponse' | 'getSnapShotResponse' | 'goToPageResponse' | 'goBackResponse' | 'goForwardResponse' | 'refreshResponse' | 'getHTMLResponse' | 'extractTextResponse';
  payload?: BrowserActionResponsePayload;
  eventId?: string;
}

export interface BrowserScreenshotResponse extends BrowserActionResponseData {
  type: 'screenshotResponse';
  payload?: BrowserActionResponsePayload & {
    screenshot: string;
    fullPage?: boolean;
  };
}

export interface BrowserNavigationResponse extends BrowserActionResponseData {
  type: 'goToPageResponse' | 'goBackResponse' | 'goForwardResponse' | 'refreshResponse';
  payload?: BrowserActionResponsePayload & {
    url?: string;
  };
}

export interface BrowserContentResponse extends BrowserActionResponseData {
  type: 'getContentResponse' | 'getMarkdownResponse' | 'getHTMLResponse' | 'extractTextResponse';
  payload?: BrowserActionResponsePayload & {
    content?: string;
    html?: string;
    markdown?: string;
    text?: string;
  };
}

export interface BrowserInfoResponse extends BrowserActionResponseData {
  type: 'getBrowserInfoResponse';
  payload?: BrowserActionResponsePayload & {
    info: BrowserViewportInfo;
  };
}

export interface BrowserSnapshotResponse extends BrowserActionResponseData {
  type: 'getSnapShotResponse';
  payload?: BrowserActionResponsePayload & {
    tree: BrowserSnapshot['tree'];
  };
}

// ================================
// Terminal Response Interfaces
// ================================

export interface TerminalExecuteResponse extends BaseWebSocketResponse {
  type: 'terminalExecuteResponse' | 'executeCommandResponse';
  status_code?: number;
  result?: string;
  output?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}

// ================================
// Git Response Interfaces
// ================================

export interface GitInitResponse extends BaseWebSocketResponse {
  type: 'gitInitResponse';
}

export interface GitCommitResponse extends BaseWebSocketResponse {
  type: 'gitCommitResponse';
  content?: string;
  hash?: string;
}

export interface GitPushResponse extends BaseWebSocketResponse {
  type: 'gitPushResponse';
}

export interface GitPullResponse extends BaseWebSocketResponse {
  type: 'gitPullResponse';
  changes?: number;
  insertions?: number;
  deletions?: number;
}

export interface GitStatusResponse extends BaseWebSocketResponse {
  type: 'gitStatusResponse';
  data?: StatusResult;
}

export interface GitLogsResponse extends BaseWebSocketResponse {
  type: 'gitLogsResponse';
  data?: CommitSummary[];
}

export interface GitDiffResponse extends BaseWebSocketResponse {
  type: 'gitDiffResponse';
  data?: DiffResult | string;
  commitHash?: string;
}

export interface GitCheckoutResponse extends BaseWebSocketResponse {
  type: 'gitCheckoutResponse';
  branch?: string;
}

export interface GitBranchResponse extends BaseWebSocketResponse {
  type: 'gitBranchResponse';
  branch?: string;
}

export interface GitCloneResponse extends BaseWebSocketResponse {
  type: 'gitCloneResponse';
  url?: string;
}

export interface AddResponse extends BaseWebSocketResponse {
  type: 'AddResponse';
  content?: string;
}

// ================================
// Memory Response Interfaces
// ================================

export interface MemorySetResponse extends BaseWebSocketResponse {
  type: 'memorySetResponse';
  key?: string;
  value?: any;
}

export interface MemoryGetResponse extends BaseWebSocketResponse {
  type: 'memoryGetResponse';
  key?: string;
  value?: any;
}

export interface MemoryDeleteResponse extends BaseWebSocketResponse {
  type: 'memoryDeleteResponse';
  key?: string;
}

export interface MemoryListResponse extends BaseWebSocketResponse {
  type: 'memoryListResponse';
  keys?: string[];
  entries?: Record<string, any>;
}

export interface MemoryClearResponse extends BaseWebSocketResponse {
  type: 'memoryClearResponse';
}

// ================================
// Task Response Interfaces
// ================================

export interface AddTaskResponse extends BaseWebSocketResponse {
  type: 'addTaskResponse';
  task?: Task;
}

export interface GetTasksResponse extends BaseWebSocketResponse {
  type: 'getTasksResponse';
  tasks?: Task[];
}

export interface UpdateTasksResponse extends BaseWebSocketResponse {
  type: 'updateTasksResponse';
  task?: Task;
}

// ================================
// Vector Database Response Interfaces
// ================================

export interface AddVectorItemResponse extends BaseWebSocketResponse {
  type: 'addVectorItemResponse';
  item?: VectorItem;
}

export interface GetVectorResponse extends BaseWebSocketResponse {
  type: 'getVectorResponse';
  vector?: number[];
  item?: VectorItem;
}

export interface QueryVectorItemResponse extends BaseWebSocketResponse {
  type: 'qeryVectorItemResponse' | 'queryVectorItemResponse';
  item?: VectorItem;
  results?: VectorQueryResult;
}

export interface QueryVectorItemsResponse extends BaseWebSocketResponse {
  type: 'qeryVectorItemsResponse' | 'queryVectorItemsResponse';
  items?: VectorItem[];
  results?: VectorQueryResult;
}

// ================================
// Debug Response Interfaces
// ================================

export interface DebugAddLogResponse extends BaseWebSocketResponse {
  type: 'debugAddLogResponse';
  logId?: string;
  timestamp?: string;
}

export interface OpenDebugBrowserResponse extends BaseWebSocketResponse {
  type: 'openDebugBrowserResponse';
  url?: string;
  port?: number;
}

export interface DebugGetLogsResponse extends BaseWebSocketResponse {
  type: 'debugGetLogsResponse';
  logs?: Array<{
    id: string;
    message: string;
    level: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}

// ================================
// Code Utils Response Interfaces
// ================================

export interface GetAllFilesMarkdownResponse extends BaseWebSocketResponse {
  type: 'getAllFilesMarkdownResponse';
  markdown?: string;
  files?: Array<{
    path: string;
    content: string;
    language?: string;
  }>;
}

export interface MatchProblemResponse extends BaseWebSocketResponse {
  type: 'matchProblemResponse';
  matches?: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

export interface AnalyzeCodeResponse extends BaseWebSocketResponse {
  type: 'analyzeCodeResponse';
  analysis?: {
    complexity: number;
    maintainability: number;
    issues: Array<{
      type: string;
      severity: string;
      message: string;
      file: string;
      line: number;
    }>;
  };
}

// ================================
// Agent Response Interfaces
// ================================

export interface FindAgentByTaskResponse extends BaseWebSocketResponse {
  type: 'findAgentByTaskResponse';
  agents?: AgentFunction[];
}

export interface ListAgentsResponse extends BaseWebSocketResponse {
  type: 'listAgentsResponse';
  agents?: AgentFunction[];
}

export interface AgentsDetailResponse extends BaseWebSocketResponse {
  type: 'agentsDetailResponse';
  payload?: {
    agents: AgentDetail[];
  };
}

export interface TaskCompletionResponse extends BaseWebSocketResponse {
  type: 'taskCompletionResponse';
  from?: string;
  agentId?: string;
  task?: string;
  result?: any;
}

// ================================
// App/State Response Interfaces
// ================================

export interface GetAppStateResponse extends BaseWebSocketResponse {
  type: 'getAppStateResponse';
  state?: Record<string, any>;
}

export interface UpdateProjectStateResponse extends BaseWebSocketResponse {
  type: 'updateProjectStateResponse';
  state?: Record<string, any>;
}

export interface GetAgentStateResponse extends BaseWebSocketResponse {
  type: 'getAgentStateResponse';
  payload?: Record<string, any>;
}

export interface AddToAgentStateResponse extends BaseWebSocketResponse {
  type: 'addToAgentStateResponse';
  payload?: { success: boolean };
}

// ================================
// Chat/Message Response Interfaces
// ================================

export interface GetChatHistoryResponse extends BaseWebSocketResponse {
  type: 'getChatHistoryResponse';
  messages?: Array<{
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    type: string;
  }>;
  agentId?: string;
}

export interface ChatSummaryResponse extends BaseWebSocketResponse {
  type: 'chatSummaryResponse';
  summary?: string;
  messageCount?: number;
  agentId?: string;
}

// ================================
// Crawler Response Interfaces
// ================================

export interface CrawlerResponse extends BaseWebSocketResponse {
  type: 'crawlerResponse';
  url?: string;
  content?: string;
  links?: string[];
  metadata?: {
    title?: string;
    description?: string;
    images?: string[];
  };
}

// ================================
// MCP Tools Response Interfaces
// ================================

export interface ExecuteToolResponse extends BaseExecuteToolResponse {
  type: 'executeToolResponse';
  toolName?: string;
  serverName?: string;
  params?: any;
  data?: [boolean, any] | { error?: string };
}

export interface GetToolsResponse extends BaseWebSocketResponse {
  type: 'getToolsResponse';
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  serverName?: string;
  data?: any[];
}

export interface ConfigureToolBoxResponse extends BaseWebSocketResponse {
  type: 'configureToolBoxResponse';
  configuration?: Record<string, any>;
  data?: any;
  error?: string;
}

// Additional MCP Service Response Interfaces (mcpService.cli.ts)
export interface GetEnabledToolBoxesResponse extends BaseWebSocketResponse {
  type: 'getEnabledToolBoxesResponse';
  data?: any[];
}

export interface GetAvailableToolBoxesResponse extends BaseWebSocketResponse {
  type: 'getAvailableToolBoxesResponse';
  data?: any[];
}

export interface GetLocalToolBoxesResponse extends BaseWebSocketResponse {
  type: 'getLocalToolBoxesResponse';
  data?: any[];
}

export interface SearchAvailableToolBoxesResponse extends BaseWebSocketResponse {
  type: 'searchAvailableToolBoxesResponse';
  data?: Record<string, any>;
}

export interface ListToolsFromToolBoxesResponse extends BaseWebSocketResponse {
  type: 'listToolsFromToolBoxesResponse';
  data?: any[];
  error?: string;
}

// Legacy MCP Response Interfaces (mcpService.cli.ts)
export interface GetMcpToolsResponse extends BaseWebSocketResponse {
  type: 'getMcpToolsResponse';
  data?: any[];
}

export interface GetMcpListResponse extends BaseWebSocketResponse {
  type: 'getMcpListResponse';
  data?: any[];
}

export interface GetAllMCPToolsResponse extends BaseWebSocketResponse {
  type: 'getAllMCPToolsResponse';
  data?: any[];
}

export interface GetEnabledMCPSResponse extends BaseWebSocketResponse {
  type: 'getEnabledMCPSResponse';
  data?: any;
}

export interface ConfigureMCPToolResponse extends BaseWebSocketResponse {
  type: 'configureMCPToolResponse';
  data?: any;
  error?: string;
}

// ================================
// Error Response Interface
// ================================

export interface ErrorResponse extends BaseWebSocketResponse {
  type: 'error';
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// ================================
// Union Types & Utility Types
// ================================

export type CLIWebSocketResponse = 
  // File System (Legacy)
  | ReadFileResponse | CreateFileResponse | WriteToFileResponse | DeleteFileResponse
  | ListDirectoryResponse | CreateDirectoryResponse | SearchFilesResponse
  | GetFileInfoResponse | MoveFileResponse | CopyFileResponse
  | GetWorkingDirectoryResponse | WatchFileResponse | CreateFolderResponse
  | UpdateFileResponse | DeleteFolderResponse
  
  // File System Service (fsService.cli.ts)
  | FsReadFileResponse | FsWriteToFileResponse | FsListFilesResponse 
  | FsListCodeDefinitionsResponse | FsSearchFilesResponse | FsGrepSearchResponse
  | FsFileSearchResponse | FsCreateFileResponse | FsCreateFolderResponse
  | FsUpdateFileResponse | FsDeleteFileResponse | FsDeleteFolderResponse
  | FsEditFileAndApplyDiffResponse | FsExecuteToolResponse
  
  // Browser
  | BrowserActionResponseData | BrowserScreenshotResponse | BrowserNavigationResponse
  | BrowserContentResponse | BrowserInfoResponse | BrowserSnapshotResponse
  | GoToPageResponse | UrlResponse | GetMarkdownResponse | HtmlReceived
  | ExtractTextResponse | GetContentResponse
  
  // Terminal
  | TerminalExecuteResponse | CommandError | CommandFinish | CommandOutput
  | TerminalInterruptResponse | TerminalInterrupted
  
  // Git
  | GitInitResponse | GitCommitResponse | GitStatusResponse | GitLogsResponse
  | GitPushResponse | GitPullResponse | GitDiffResponse | GitCheckoutResponse
  | GitBranchResponse | GitCloneResponse
  
  // Memory
  | MemorySetResponse | MemoryGetResponse | MemoryDeleteResponse
  | MemoryListResponse | MemoryClearResponse
  
  // Tasks
  | AddTaskResponse | GetTasksResponse | UpdateTasksResponse
  
  // Vector Database
  | AddVectorItemResponse | GetVectorResponse | QueryVectorItemResponse | QueryVectorItemsResponse
  
  // Debug
  | DebugAddLogResponse | OpenDebugBrowserResponse | DebugGetLogsResponse
  
  // Code Utils
  | GetAllFilesMarkdownResponse | MatchProblemResponse | AnalyzeCodeResponse
  | GetMatcherListTreeResponse | getMatchDetail | GetJsTreeResponse
  
  // Problem Matcher
  | ProblemMatcherResponse | GetMatcherListResponse | GetMatchDetailResponse
  
  // JS Tree Parser
  | JsTreeParseResponse
  
  // Notification
  | NotificationSendResponse
  
  // Agents
  | FindAgentByTaskResponse | ListAgentsResponse | AgentsDetailResponse | TaskCompletionResponse
  
  // App/State
  | GetAppStateResponse | UpdateProjectStateResponse | GetAgentStateResponse | AddToAgentStateResponse
  
  // Chat/Messages
  | GetChatHistoryResponse | ChatSummaryResponse | ChatMessage | UserMessage
  | GetSummarizeAllResponse | GetSummarizeResponse
  
  // LLM
  | LLMResponse
  
  // Tokenizer
  | AddTokenResponse | GetTokenResponse
  
  // Project
  | GetProjectPathResponse | GetProjectSettingsResponse | GetRepoMapResponse | GetProjectStateResponse
  
  // Crawler
  | CrawlerResponse
  
  // MCP Tools
  | ExecuteToolResponse | GetToolsResponse | ConfigureToolBoxResponse
  | GetEnabledToolBoxesResponse | GetAvailableToolBoxesResponse | GetLocalToolBoxesResponse
  | SearchAvailableToolBoxesResponse | ListToolsFromToolBoxesResponse
  | GetMcpToolsResponse | GetMcpListResponse | GetAllMCPToolsResponse
  | GetEnabledMCPSResponse | ConfigureMCPToolResponse
  
  // Error
  | ErrorResponse;

// ================================
// Service Response Type Mapping
// ================================

export interface ServiceResponseTypeMap {
  filesystem: ReadFileResponse | CreateFileResponse | WriteToFileResponse | DeleteFileResponse | ListDirectoryResponse;
  fsService: FsReadFileResponse | FsWriteToFileResponse | FsListFilesResponse | FsListCodeDefinitionsResponse 
            | FsSearchFilesResponse | FsGrepSearchResponse | FsFileSearchResponse | FsCreateFileResponse 
            | FsCreateFolderResponse | FsUpdateFileResponse | FsDeleteFileResponse | FsDeleteFolderResponse 
            | FsEditFileAndApplyDiffResponse | FsExecuteToolResponse;
  browser: BrowserActionResponseData | BrowserScreenshotResponse | BrowserNavigationResponse;
  terminal: TerminalExecuteResponse;
  git: GitInitResponse | GitCommitResponse | GitStatusResponse | GitLogsResponse | GitPushResponse | GitPullResponse | GitDiffResponse;
  memory: MemorySetResponse | MemoryGetResponse | MemoryDeleteResponse;
  tasks: AddTaskResponse | GetTasksResponse | UpdateTasksResponse;
  vectordb: AddVectorItemResponse | GetVectorResponse | QueryVectorItemResponse;
  debug: DebugAddLogResponse | OpenDebugBrowserResponse;
  codeutils: GetAllFilesMarkdownResponse | MatchProblemResponse | GetJsTreeResponse;
  agents: FindAgentByTaskResponse | ListAgentsResponse | AgentsDetailResponse;
  state: GetAppStateResponse | UpdateProjectStateResponse | GetAgentStateResponse | AddToAgentStateResponse;
  chat: GetChatHistoryResponse | ChatSummaryResponse | GetSummarizeAllResponse | GetSummarizeResponse;
  crawler: CrawlerResponse;
  mcp: ExecuteToolResponse | GetToolsResponse | ConfigureToolBoxResponse | GetEnabledToolBoxesResponse 
       | GetAvailableToolBoxesResponse | GetLocalToolBoxesResponse | SearchAvailableToolBoxesResponse
       | ListToolsFromToolBoxesResponse | GetMcpToolsResponse | GetMcpListResponse 
       | GetAllMCPToolsResponse | GetEnabledMCPSResponse | ConfigureMCPToolResponse;
  project: GetProjectPathResponse | GetProjectSettingsResponse | GetRepoMapResponse | GetProjectStateResponse;
  notification: NotificationSendResponse;
  problemMatcher: ProblemMatcherResponse | GetMatcherListResponse | GetMatchDetailResponse;
  jsTreeParser: JsTreeParseResponse;
}

// ================================
// Type Guards
// ================================

export function isSuccessResponse(response: CLIWebSocketResponse): response is CLIWebSocketResponse & { success: true } {
  return response.success === true;
}

export function isFailureResponse(response: CLIWebSocketResponse): response is CLIWebSocketResponse & { success: false } {
  return response.success === false;
}

export function isErrorResponse(response: CLIWebSocketResponse): response is ErrorResponse {
  return response.type === 'error';
}

export function isBrowserResponse(response: CLIWebSocketResponse): response is BrowserActionResponseData {
  return response.type.includes('browser') || response.type.includes('screenshot') || response.type.includes('Content');
}

export function isGitResponse(response: CLIWebSocketResponse): response is GitInitResponse | GitCommitResponse | GitStatusResponse {
  return response.type.startsWith('git');
}

export function isFsServiceResponse(response: CLIWebSocketResponse): response is 
  FsReadFileResponse | FsWriteToFileResponse | FsListFilesResponse | FsListCodeDefinitionsResponse |
  FsSearchFilesResponse | FsGrepSearchResponse | FsFileSearchResponse | FsCreateFileResponse |
  FsCreateFolderResponse | FsUpdateFileResponse | FsDeleteFileResponse | FsDeleteFolderResponse |
  FsEditFileAndApplyDiffResponse | FsExecuteToolResponse {
  return response.type.includes('readFileResponse') || 
         response.type.includes('writeToFileResponse') ||
         response.type.includes('fileListResponse') ||
         response.type.includes('listCodeDefinitionNamesResponse') ||
         response.type.includes('searchFilesResponse') ||
         response.type.includes('grepSearchResponse') ||
         response.type.includes('fileSearchResponse') ||
         response.type.includes('createFileResponse') ||
         response.type.includes('createFolderResponse') ||
         response.type.includes('updateFileResponse') ||
         response.type.includes('deleteFileResponse') ||
         response.type.includes('deleteFolderResponse') ||
         response.type.includes('editFileAndApplyDiffResponse') ||
         response.type.includes('fsExecuteToolResponse');
}

export function isFsServiceSuccessResponse(response: CLIWebSocketResponse): response is 
  (FsReadFileResponse | FsWriteToFileResponse | FsListFilesResponse | FsListCodeDefinitionsResponse |
   FsSearchFilesResponse | FsGrepSearchResponse | FsFileSearchResponse | FsCreateFileResponse |
   FsCreateFolderResponse | FsUpdateFileResponse | FsDeleteFileResponse | FsDeleteFolderResponse |
   FsEditFileAndApplyDiffResponse | FsExecuteToolResponse) & { success: true } {
  return isFsServiceResponse(response) && response.success === true;
}

export function isFsServiceErrorResponse(response: CLIWebSocketResponse): response is 
  (FsReadFileResponse | FsWriteToFileResponse | FsListFilesResponse | FsListCodeDefinitionsResponse |
   FsSearchFilesResponse | FsGrepSearchResponse | FsFileSearchResponse | FsCreateFileResponse |
   FsCreateFolderResponse | FsUpdateFileResponse | FsDeleteFileResponse | FsDeleteFolderResponse |
   FsEditFileAndApplyDiffResponse | FsExecuteToolResponse) & { success: false } {
  return isFsServiceResponse(response) && response.success === false;
}

// ================================
// Helper Types
// ================================

export type SuccessResponse<T = any> = CLIWebSocketResponse & { success: true; data?: T };
export type FailureResponse = CLIWebSocketResponse & { success: false; error: string };

export type WebSocketMessageHandler<T extends CLIWebSocketResponse = CLIWebSocketResponse> = (
  response: T
) => void | Promise<void>;

export type ServiceWebSocketHandler<K extends keyof ServiceResponseTypeMap> = WebSocketMessageHandler<
  ServiceResponseTypeMap[K]
>;

// ================================
// Additional Missing Response Interfaces
// ================================

// Notification Response Interfaces (notificationService.cli.ts)
export interface NotificationSendResponse extends BaseWebSocketResponse {
  type: 'notificationSendResponse';
  eventType?: string;
  componentType?: string;
  result?: string;
}

// Project Response Interfaces (projectService.ts)
export interface GetProjectSettingsResponse extends BaseWebSocketResponse {
  type: 'getProjectSettingsResponse';
  projectSettings?: Record<string, any>;
}

export interface GetRepoMapResponse extends BaseWebSocketResponse {
  type: 'getRepoMapResponse';
  repoMap?: any;
}

// JS Tree Parser Response Interfaces (jsTreeParser.cli.ts)
export interface JsTreeParseResponse extends BaseWebSocketResponse {
  type: 'jsTreeParseResponse';
  filePath?: string;
  tree?: any;
  data?: any;
}

export interface GetJsTreeResponse extends BaseWebSocketResponse {
  type: 'getJsTreeResponse';
  payload?: any;
  trees?: any[];
}

// Problem Matcher Response Interfaces (problemMacher.cli.ts)
export interface ProblemMatcherResponse extends BaseWebSocketResponse {
  type: 'problemMatcherResponse';
  problems?: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

export interface GetMatcherListResponse extends BaseWebSocketResponse {
  type: 'getMatcherListResponse';
  matchers?: Array<{
    name: string;
    description: string;
    language: string;
    pattern: string;
  }>;
}

export interface GetMatchDetailResponse extends BaseWebSocketResponse {
  type: 'getMatchDetailResponse';
  matcher?: {
    name: string;
    description: string;
    language: string;
    pattern: string;
    examples?: string[];
  };
}

// MCP Tool Response Interfaces (mcpService.cli.ts)
export interface GetEnabledToolBoxesResponse extends BaseWebSocketResponse {
  type: 'getEnabledToolBoxesResponse';
  data?: any[];
}

export interface GetAvailableToolBoxesResponse extends BaseWebSocketResponse {
  type: 'getAvailableToolBoxesResponse';
  data?: any[];
}

export interface GetLocalToolBoxesResponse extends BaseWebSocketResponse {
  type: 'getLocalToolBoxesResponse';
  data?: any[];
}

// Chat Summary Response Interfaces (chatHistory.cli.ts)
export interface GetSummarizeAllResponse extends BaseWebSocketResponse {
  type: 'getSummarizeAllResponse';
  payload?: string;
  summary?: string;
}

export interface GetSummarizeResponse extends BaseWebSocketResponse {
  type: 'getSummarizeResponse';
  payload?: string;
  summary?: string;
  depth?: number;
}

// Additional Missing Response Interfaces
export interface GetProjectStateResponse extends BaseWebSocketResponse {
  type: 'getProjectStateResponse';
  projectState?: Record<string, any>;
}

export interface GitPushResponse extends BaseWebSocketResponse {
  type: 'gitPushResponse';
  success?: boolean;
}

export interface GitPullResponse extends BaseWebSocketResponse {
  type: 'gitPullResponse';
  success?: boolean;
  changes?: number;
  insertions?: number;
  deletions?: number;
}

export interface GitDiffResponse extends BaseWebSocketResponse {
  type: 'gitDiffResponse';
  data?: DiffResult | string;
  commitHash?: string;
}

export interface GitCheckoutResponse extends BaseWebSocketResponse {
  type: 'gitCheckoutResponse';
  branch?: string;
}

export interface GitBranchResponse extends BaseWebSocketResponse {
  type: 'gitBranchResponse';
  branch?: string;
}

export interface GitCloneResponse extends BaseWebSocketResponse {
  type: 'gitCloneResponse';
  url?: string;
} 