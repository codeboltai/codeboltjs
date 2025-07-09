/**
 * TypeScript interfaces for WebSocket message types
 * 
 * This file contains all types related to WebSocket messages:
 * - Incoming message types (from client to server)
 * - Outgoing response types (from server to client)
 * - WebSocket communication protocols
 */

// ================================
// Base WebSocket Message Interfaces
// ================================

export interface BaseWebSocketMessage {
  type: string;
  messageId?: string;
  threadId?: string;
  requestId?: string;
}

export interface BaseWebSocketResponse extends BaseWebSocketMessage {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface BaseExecuteToolResponse extends BaseWebSocketResponse {
  result?: any;
  status?: 'pending' | 'executing' | 'success' | 'error' | 'rejected';
}

// ================================
// User Message Types
// ================================

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

export interface ChatMessage extends BaseWebSocketResponse {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: string;
  role?: 'user' | 'assistant' | 'system';
  metadata?: Record<string, any>;
}

// ================================
// File System Service Response Interfaces
// ================================

export interface BaseFsResponse extends BaseWebSocketResponse {
  path?: string;
  success: boolean;
}

export interface FsReadFileResponse extends BaseFsResponse {
  type: 'readFileResponse';
  content?: string;
  encoding?: string;
  result?: string;
}

export interface FsWriteToFileResponse extends BaseFsResponse {
  type: 'writeToFileResponse';
  result?: string;
  bytesWritten?: number;
}

export interface FsListFilesResponse extends BaseFsResponse {
  type: 'fileListResponse';
  files?: string[];
  result?: string;
  isRecursive?: boolean;
}

export interface FsListCodeDefinitionsResponse extends BaseFsResponse {
  type: 'listCodeDefinitionNamesResponse';
  definitions?: string[];
  result?: string;
}

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
  result?: string;
  filePattern?: string;
}

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
  result?: string;
}

export interface FsFileSearchResponse extends BaseFsResponse {
  type: 'fileSearchResponse';
  query?: string;
  results?: string[];
  result?: string;
}

export interface FsCreateFileResponse extends BaseFsResponse {
  type: 'createFileResponse';
  fileName?: string;
  source?: string;
}

export interface FsCreateFolderResponse extends BaseFsResponse {
  type: 'createFolderResponse';
  folderName?: string;
}

export interface FsUpdateFileResponse extends BaseFsResponse {
  type: 'updateFileResponse';
  newContent?: string;
  bytesWritten?: number;
}

export interface FsDeleteFileResponse extends BaseFsResponse {
  type: 'deleteFileResponse';
  filename?: string;
}

export interface FsDeleteFolderResponse extends BaseFsResponse {
  type: 'deleteFolderResponse';
  foldername?: string;
}

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
// Terminal Response Interfaces
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
// Browser Response Interfaces
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
  screenshot?: string;
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
  success?: boolean;
}

export interface GitPullResponse extends BaseWebSocketResponse {
  type: 'gitPullResponse';
  success?: boolean;
  changes?: number;
  insertions?: number;
  deletions?: number;
}

export interface GitStatusResponse extends BaseWebSocketResponse {
  type: 'gitStatusResponse';
  data?: import('./commonTypes').StatusResult;
}

export interface GitLogsResponse extends BaseWebSocketResponse {
  type: 'gitLogsResponse';
  data?: import('./commonTypes').CommitSummary[];
}

export interface GitDiffResponse extends BaseWebSocketResponse {
  type: 'gitDiffResponse';
  data?: import('./commonTypes').DiffResult | string;
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
// LLM Response Interfaces
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
  task?: import('./commonTypes').Task;
}

export interface GetTasksResponse extends BaseWebSocketResponse {
  type: 'getTasksResponse';
  tasks?: import('./commonTypes').Task[];
}

export interface UpdateTasksResponse extends BaseWebSocketResponse {
  type: 'updateTasksResponse';
  task?: import('./commonTypes').Task;
}

// ================================
// Vector Database Response Interfaces
// ================================

export interface AddVectorItemResponse extends BaseWebSocketResponse {
  type: 'addVectorItemResponse';
  item?: import('./commonTypes').VectorItem;
}

export interface GetVectorResponse extends BaseWebSocketResponse {
  type: 'getVectorResponse';
  vector?: number[];
  item?: import('./commonTypes').VectorItem;
}

export interface QueryVectorItemResponse extends BaseWebSocketResponse {
  type: 'qeryVectorItemResponse' | 'queryVectorItemResponse';
  item?: import('./commonTypes').VectorItem;
  results?: import('./commonTypes').VectorQueryResult;
}

export interface QueryVectorItemsResponse extends BaseWebSocketResponse {
  type: 'qeryVectorItemsResponse' | 'queryVectorItemsResponse';
  items?: import('./commonTypes').VectorItem[];
  results?: import('./commonTypes').VectorQueryResult;
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
// Agent Response Interfaces
// ================================

export interface FindAgentByTaskResponse extends BaseWebSocketResponse {
  type: 'findAgentByTaskResponse';
  agents?: import('./commonTypes').AgentFunction[];
}

export interface ListAgentsResponse extends BaseWebSocketResponse {
  type: 'listAgentsResponse';
  agents?: import('./commonTypes').AgentFunction[];
}

export interface AgentsDetailResponse extends BaseWebSocketResponse {
  type: 'agentsDetailResponse';
  payload?: {
    agents: import('./commonTypes').AgentDetail[];
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

// ================================
// Tokenizer Response Interfaces
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
// Project Response Interfaces
// ================================

export interface GetProjectPathResponse extends BaseWebSocketResponse {
  type: 'getProjectPathResponse';
  projectPath?: string;
  projectName?: string;
}

export interface GetProjectSettingsResponse extends BaseWebSocketResponse {
  type: 'getProjectSettingsResponse';
  projectSettings?: Record<string, any>;
}

export interface GetRepoMapResponse extends BaseWebSocketResponse {
  type: 'getRepoMapResponse';
  repoMap?: any;
}

export interface GetProjectStateResponse extends BaseWebSocketResponse {
  type: 'getProjectStateResponse';
  projectState?: Record<string, any>;
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
// Notification Response Interfaces
// ================================

export interface NotificationSendResponse extends BaseWebSocketResponse {
  type: 'notificationSendResponse';
  eventType?: string;
  componentType?: string;
  result?: string;
}

// ================================
// JS Tree Parser Response Interfaces
// ================================

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

// ================================
// Problem Matcher Response Interfaces
// ================================

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

// ================================
// File System Response Interfaces (Legacy)
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
// Union Types
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
  | GitBranchResponse | GitCloneResponse | AddResponse
  
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
// Type Guards
// ================================

export function isSuccessResponse(response: CLIWebSocketResponse): response is CLIWebSocketResponse & { success: true } {
  return 'success' in response && response.success === true;
}

export function isFailureResponse(response: CLIWebSocketResponse): response is CLIWebSocketResponse & { success: false } {
  return 'success' in response && response.success === false;
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
