import { z } from 'zod';

// Import types from agent-to-app-ws-types.ts
import {
  // Action Event Types
  type CreateFileEvent,
  type CreateFolderEvent,
  type ReadFileEvent,
  type UpdateFileEvent,
  type DeleteFileEvent,
  type DeleteFolderEvent,
  type FileListEvent,
  type SearchFilesEvent,
  type WriteToFileEvent,
  type GrepSearchEvent,
  type NewPageEvent,
  type GetUrlEvent,
  type GoToPageEvent,
  type ScreenshotEvent,
  type GetHtmlEvent,
  type GetMarkdownEvent,
  type GetPdfEvent,
  type ExtractTextEvent,
  type GetContentEvent,
  type ClickEvent,
  type TypeEvent,
  type ScrollEvent,
  type EnterEvent,
  type CloseEvent,
  type GetBrowserInfoEvent,
  type GetSnapShotEvent,
  type GetChatHistoryEvent,
  type SendMessageEvent,
  type WaitforReplyEvent,
  type ProcessStartedEvent,
  type ProcessStoppedEvent,
  type ProcessFinishedEvent,
  type FindAgentEvent,
  type StartAgentEvent,
  type ListAgentsEvent,
  type GetAgentsDetailEvent,
  type GitInitEvent,
  type GitPullEvent,
  type GitPushEvent,
  type GitStatusEvent,
  type GitAddEvent,
  type GitCommitEvent,
  type GitCheckoutEvent,
  type GitBranchEvent,
  type GitLogsEvent,
  type GitDiffEvent,
  type InferenceEvent,
  type ExecuteCommandEvent,
  type ExecuteCommandWithStreamEvent,
  type ExecuteCommandRunUntilErrorEvent,
  type SendInterruptToTerminalEvent,
  type AddTaskEvent,
  type GetTasksEvent,
  type UpdateTaskEvent,
  type DeleteTaskEvent,
  type AddSubTaskEvent,
  type UpdateSubTaskEvent,
  type AddVectorItemEvent,
  type QueryVectorItemEvent,
  type GetVectorEvent,
  type QueryVectorItemsEvent,
  type MemorySetEvent,
  type MemoryGetEvent,
  type GetApplicationStateEvent,
  type AddToAgentStateEvent,
  type GetAgentStateEvent,
  type GetProjectStateEvent,
  type UpdateProjectStateEvent,
  type AddLogEvent,
  type AddTokenEvent,
  type GetTokenEvent,
  type GetProjectPathEvent,
  type StartCrawlerEvent,
  type GetEnabledToolBoxesEvent,
  type GetToolsEvent,
  type ExecuteToolEvent,
  type SummarizeAllEvent,
  type SummarizeEvent,
  type GetTasksByAgentEvent,
  type OpenDebugBrowserEvent,
  // Additional FS Event Types
  type FsEvent,
  type ListCodeDefinitionNamesEvent,
  type FileSearchEvent,
  type EditFileWithDiffEvent,
  ConfirmationRequestEvent,
  NotificationEvent,
  GetProjectSettingsEvent,
  SearchEvent,
  PdfToTextEvent,
  // Additional Browser Event Types - these are not available in current schema exports
} from '../agent-to-app-ws-types';

// Import response types from app-to-agent-ws-types.ts
import {
  type CreateFileSuccessResponse,
  type CreateFileErrorResponse,
  type CreateFolderSuccessResponse,
  type CreateFolderErrorResponse,
  type ReadFileSuccessResponse,
  type ReadFileSuccessResultResponse,
  type UpdateFileSuccessResponse,
  type UpdateFileErrorResponse,
  type DeleteFileSuccessResponse,
  type DeleteFileErrorResponse,
  type DeleteFolderSuccessResponse,
  type DeleteFolderErrorResponse,
  type FileListSuccessResponse,
  type FileListErrorResponse,
  type SearchFilesSuccessResponse,
  type SearchFilesErrorResponse,
  type WriteToFileSuccessResponse,
  type WriteToFileErrorResponse,
  type GrepSearchSuccessResponse,
  type GrepSearchErrorResponse,
  type NewPageResponse,
  type ScrollResponse,
  type TypeResponse,
  type ClickResponse,
  type EnterResponse,
  type SearchResponse,
  type BrowserActionResponseData,
  type GetUrlResponse,
  type GoToPageResponse,
  type ScreenshotResponse,
  type HtmlReceived,
  type GetMarkdownResponse,
  type GetContentResponse,
  type GetSnapShotResponse,
  type GetBrowserInfoResponse,
  type ExtractTextResponse,
  type GetChatHistoryResponse,
  type FindAgentByTaskResponse,
  type ListAgentsResponse,
  type AgentsDetailResponse,
  type GitInitResponse,
  type GitPullResponse,
  type GitPushResponse,
  type GitStatusResponse,
  type GitAddResponse,
  type GitCommitResponse,
  type GitCheckoutResponse,
  type GitBranchResponse,
  type GitLogsResponse,
  type GitDiffResponse,
  // type CrawlResponse,
  type GetEnabledToolBoxesResponse,
  type GetToolsResponse,
  type AddTokenResponse,
  type GetTokenResponse,
  type ChatHistoryResponse,
  type WaitForReplyResponse,
  type ConfirmationResponse,
  type FeedbackResponse,
  type GetSummarizeAllResponse,
  type GetSummarizeResponse,
  type GetTasksByAgentResponse, 
  type TaskCompletionResponse,
  // Additional FS Response Types
  type ListCodeDefinitionNamesSuccessResponse,
  type ListCodeDefinitionNamesErrorResponse,
  type FileSearchSuccessResponse,
  type FileSearchErrorResponse,
  type EditFileAndApplyDiffSuccessResponse,
  type EditFileAndApplyDiffErrorResponse,
  OpenDebugBrowserResponse,
  GetProjectSettingsResponse,
  // Terminal service responses
  type CommandOutputResponse,
  type CommandErrorResponse,
  type CommandFinishResponse,
  type TerminalInterruptResponse,
  type TerminalServiceResponse,
  // Project service responses
  type GetProjectPathResponse,
  type GetRepoMapResponse,
  type GetEditorFileStatusResponse,
  type ProjectServiceResponse,
  // Task service responses
  type TaskResponse,
  type AddTaskResponse,
  type GetTasksResponse,
  type UpdateTasksResponse,
  type DeleteTaskResponse,
  type AddSubTaskResponse,
  type UpdateSubTaskResponse,
  type TaskServiceResponse,
  // LLM service responses
  type LLMResponse,
  type LLMServiceResponse,
  // State service responses
  type GetAppStateResponse,
  type AddToAgentStateResponse,
  type GetAgentStateResponse,
  type GetProjectStateResponse,
  type UpdateProjectStateResponse,
  type StateServiceResponse,
  // VectorDB service responses
  type GetVectorResponse,
  type AddVectorItemResponse,
  type QueryVectorItemResponse,
  type QueryVectorItemsResponse,
  type VectorDBServiceResponse,
  // Utils service responses
  type UtilsServiceResponse,
  type EditFileAndApplyDiffResponse,
  // Tokenizer service responses
  type TokenizerServiceResponse,
  // MCP service responses
  type GetLocalToolBoxesResponse,
  type GetAvailableToolBoxesResponse,
  type SearchAvailableToolBoxesResponse,
  type ListToolsFromToolBoxesResponse,
  type ConfigureToolBoxResponse,
  type ExecuteToolResponse,
  type MCPServiceResponse,
  // Debug service responses
  type DebugAddLogResponse,
  type GetDebugLogsResponse,
  type DebugServiceResponse,
  // DB Memory service responses
  type MemorySetResponse,
  type MemoryGetResponse,
  type DBMemoryServiceResponse,
  // Code Utils service responses
  type GetJsTreeResponse,
  type GetAllFilesAsMarkdownResponse,
  type MatchProblemResponse,
  type GetMatcherListTreeResponse,
  type GetMatchDetailResponse,
  type CodeUtilsServiceResponse,


  // Crawler service responses
  type CrawlResponse,
  type CrawlerServiceResponse
} from '../app-to-agent-ws-types';

// Import agent-to-app event types
import {
  type GetAllFilesMarkdownEvent,
  type PerformMatchEvent,
  type GetMatcherListEvent,
  type GetMatchDetailEvent,
  type CodeUtilsEvent,
} from '../agent-to-app-ws-types';

// Import schemas from agent-to-app-ws-schema.ts
import {
  createFileEventSchema,
  createFolderEventSchema,
  readFileEventSchema,
  updateFileEventSchema,
  deleteFileEventSchema,
  deleteFolderEventSchema,
  fileListEventSchema,
  searchFilesEventSchema,
  writeToFileEventSchema,
  grepSearchEventSchema,
  newPageEventSchema,
  getUrlEventSchema,
  goToPageEventSchema,
  screenshotEventSchema,
  getHtmlEventSchema,
  getMarkdownEventSchema,
  getPdfEventSchema,
  extractTextEventSchema,
  getContentEventSchema,
  clickEventSchema,
  typeEventSchema,
  scrollEventSchema,
  enterEventSchema,
  closeEventSchema,
  getBrowserInfoEventSchema,
  getSnapShotEventSchema,
  getChatHistoryEventSchema,
  confirmationRequestEventSchema,
  sendMessageEventSchema,
  waitforReplyEventSchema,
  processStartedEventSchema,
  processStoppedEventSchema,
  processFinishedEventSchema,
  findAgentEventSchema,
  startAgentEventSchema,
  listAgentsEventSchema,
  getAgentsDetailEventSchema,
  gitInitEventSchema,
  gitPullEventSchema,
  gitPushEventSchema,
  gitStatusEventSchema,
  gitAddEventSchema,
  gitCommitEventSchema,
  gitCheckoutEventSchema,
  gitBranchEventSchema,
  gitLogsEventSchema,
  gitDiffEventSchema,
  inferenceEventSchema,
  executeCommandEventSchema,
  executeCommandWithStreamEventSchema,
  executeCommandRunUntilErrorEventSchema,
  sendInterruptToTerminalEventSchema,
  addTaskEventSchema,
  getTasksEventSchema,
  updateTaskEventSchema,
  deleteTaskEventSchema,
  addSubTaskEventSchema,
  updateSubTaskEventSchema,
  addVectorItemEventSchema,
  queryVectorItemEventSchema,
  getVectorEventSchema,
  queryVectorItemsEventSchema,
  memorySetEventSchema,
  memoryGetEventSchema,
  getApplicationStateEventSchema,
  addToAgentStateEventSchema,
  getAgentStateEventSchema,
  getProjectStateEventSchema,
  updateProjectStateEventSchema,
  addLogEventSchema,
  addTokenEventSchema,
  getTokenEventSchema,
  getProjectPathEventSchema,
  startCrawlerEventSchema,
  getEnabledToolBoxesEventSchema,
  getToolsEventSchema,
  executeToolEventSchema,
  summarizeAllEventSchema,
  summarizeEventSchema,
  getTasksByAgentEventSchema,
  openDebugBrowserEventSchema,
  // Additional FS Event Schemas
  fsEventBaseSchema,
  listCodeDefinitionNamesEventSchema,
  fileSearchEventSchema,
  editFileWithDiffEventSchema,
  getProjectSettingsEventSchema,
  notificationEventSchema,
  searchEventSchema,
  pdfToTextEventSchema,
  // Additional Browser Event Schemas - these are not available in current schema exports
} from '../agent-to-app-ws-schema';

// Import Code Utils Event Schemas
import {
  GetAllFilesMarkdownEventSchema,
  PerformMatchEventSchema,
  GetMatcherListEventSchema,
  GetMatchDetailEventSchema,
  codeUtilsEventSchema
} from '../wstypes/agent-to-app-ws/actions/codeUtilsEventSchemas';

// Import notification schemas
import {
  // FS Notifications
  fileCreateRequestNotificationSchema,
  fileCreateResponseNotificationSchema,
  folderCreateRequestNotificationSchema,
  folderCreateResponseNotificationSchema,
  fileReadRequestNotificationSchema,
  fileReadResponseNotificationSchema,
  fileEditRequestNotificationSchema,
  fileEditResponseNotificationSchema,
  fileDeleteRequestNotificationSchema,
  fileDeleteResponseNotificationSchema,
  folderDeleteRequestNotificationSchema,
  folderDeleteResponseNotificationSchema,
  listDirectoryRequestNotificationSchema,
  listDirectoryResponseNotificationSchema,
  writeToFileRequestNotificationSchema,
  writeToFileResponseNotificationSchema,
  // Git Notifications
  gitInitRequestNotificationSchema,
  gitInitResponseNotificationSchema,
  gitPullRequestNotificationSchema,
  gitPullResponseNotificationSchema,
  gitPushRequestNotificationSchema,
  gitPushResponseNotificationSchema,
  gitStatusRequestNotificationSchema,
  gitStatusResponseNotificationSchema,
  gitAddRequestNotificationSchema,
  gitAddResponseNotificationSchema,
  gitCommitRequestNotificationSchema,
  gitCommitResponseNotificationSchema,
  gitCheckoutRequestNotificationSchema,
  gitCheckoutResponseNotificationSchema,
  gitBranchRequestNotificationSchema,
  gitBranchResponseNotificationSchema,
  gitLogsRequestNotificationSchema,
  gitLogsResponseNotificationSchema,
  gitDiffRequestNotificationSchema,
  gitDiffResponseNotificationSchema,
  // Browser Notifications
  webFetchRequestNotificationSchema,
  webFetchResponseNotificationSchema,
  webSearchRequestNotificationSchema,
  webSearchResponseNotificationSchema,
  // Chat Notifications
  userMessageRequestNotificationSchema,
  agentTextResponseNotificationSchema,
  getChatHistoryRequestNotificationSchema,
  getChatHistoryResultNotificationSchema,
  // Terminal Notifications
  commandExecutionRequestNotificationSchema,
  commandExecutionResponseNotificationSchema,
  // LLM Notifications
  llmRequestNotificationSchema,
  llmResponseNotificationSchema,
  llmGetTokenCountRequestNotificationSchema,
  llmGetTokenCountResponseNotificationSchema,
  // Memory Notifications
  addMemoryRequestNotificationSchema,
  addMemoryResultNotificationSchema,
  getMemoryRequestNotificationSchema,
  getMemoryResultNotificationSchema,
  // MCP Notifications
  getEnabledMCPServersRequestNotificationSchema,
  getEnabledMCPServersResultNotificationSchema,
  listToolsFromMCPServersRequestNotificationSchema,
  listToolsFromMCPServersResultNotificationSchema,
  getToolsRequestNotificationSchema,
  getToolsResultNotificationSchema,
  executeToolRequestNotificationSchema,
  executeToolResultNotificationSchema,
  // Agent Notifications
  startSubagentTaskRequestNotificationSchema,
  startSubagentTaskResponseNotificationSchema,
  subagentTaskCompletedNotificationSchema,
  // Crawler Notifications
  crawlerSearchRequestNotificationSchema,
  crawlerSearchResponseNotificationSchema,
  crawlerStartRequestNotificationSchema,
  crawlerStartResponseNotificationSchema,
  // Search Notifications
  searchInitRequestSchema,
  searchRequestSchema,
  getFirstLinkRequestSchema,
  codebaseSearchRequestSchema,
  searchInitResultSchema,
  searchResultSchema,
  getFirstLinkResultSchema,
  codebaseSearchResultSchema,
  // History Notifications
  summarizePreviousConversationRequestNotificationSchema,
  summarizePreviousConversationResultNotificationSchema,
  summarizeCurrentMessageRequestNotificationSchema,
  summarizeCurrentMessageResultNotificationSchema,
  // Code Utils Notifications
  grepSearchRequestNotificationSchema,
  grepSearchResponseNotificationSchema,
  globSearchRequestNotificationSchema,
  globSearchResponseNotificationSchema,
  // Todo Notifications
  addTodoRequestNotificationSchema,
  addTodoResponseNotificationSchema,
  getTodoRequestNotificationSchema,
  getTodoTasksResponseNotificationSchema,
  editTodoTaskRequestNotificationSchema,
  editTodoTaskResponseNotificationSchema,
  // System Notifications
  agentInitNotificationSchema,
  agentCompletionNotificationSchema
} from '../agent-to-app-ws-schema';

// Import notification types
import {
  // FS Notification Types
  type FileCreateRequestNotification,
  type FileCreateResponseNotification,
  type FolderCreateRequestNotification,
  type FolderCreateResponseNotification,
  type FileReadRequestNotification,
  type FileReadResponseNotification,
  type FileEditRequestNotification,
  type FileEditResponseNotification,
  type FileDeleteRequestNotification,
  type FileDeleteResponseNotification,
  type FolderDeleteRequestNotification,
  type FolderDeleteResponseNotification,
  type ListDirectoryRequestNotification,
  type ListDirectoryResponseNotification,
  type WriteToFileRequestNotification,
  type WriteToFileResponseNotification,
  // Git Notification Types
  type GitInitRequestNotification,
  type GitInitResponseNotification,
  type GitPullRequestNotification,
  type GitPullResponseNotification,
  type GitPushRequestNotification,
  type GitPushResponseNotification,
  type GitStatusRequestNotification,
  type GitStatusResponseNotification,
  type GitAddRequestNotification,
  type GitAddResponseNotification,
  type GitCommitRequestNotification,
  type GitCommitResponseNotification,
  type GitCheckoutRequestNotification,
  type GitCheckoutResponseNotification,
  type GitBranchRequestNotification,
  type GitBranchResponseNotification,
  type GitLogsRequestNotification,
  type GitLogsResponseNotification,
  type GitDiffRequestNotification,
  type GitDiffResponseNotification,
  // Browser Notification Types
  type WebFetchRequestNotification,
  type WebFetchResponseNotification,
  type WebSearchRequestNotification,
  type WebSearchResponseNotification,
  // Chat Notification Types
  type UserMessageRequestNotification,
  type AgentTextResponseNotification,
  type GetChatHistoryRequestNotification,
  type GetChatHistoryResultNotification,
  // Terminal Notification Types
  type CommandExecutionRequestNotification,
  type CommandExecutionResponseNotification,
  // LLM Notification Types
  type LlmRequestNotification,
  type LlmResponseNotification,
  type LlmGetTokenCountRequestNotification,
  type LlmGetTokenCountResponseNotification,
  // Memory Notification Types
  type AddMemoryRequestNotification,
  type AddMemoryResultNotification,
  type GetMemoryRequestNotification,
  type GetMemoryResultNotification,
  // MCP Notification Types
  type GetEnabledMCPServersRequestNotification,
  type GetEnabledMCPServersResultNotification,
  type ListToolsFromMCPServersRequestNotification,
  type ListToolsFromMCPServersResultNotification,
  type GetToolsRequestNotification,
  type GetToolsResultNotification,
  type ExecuteToolRequestNotification,
  type ExecuteToolResultNotification,
  // Agent Notification Types
  type StartSubagentTaskRequestNotification,
  type StartSubagentTaskResponseNotification,
  type SubagentTaskCompletedNotification,
  // Crawler Notification Types
  type CrawlerSearchRequestNotification,
  type CrawlerSearchResponseNotification,
  type CrawlerStartRequestNotification,
  type CrawlerStartResponseNotification,
  // Search Notification Types
  type SearchInitRequest,
  type SearchRequest,
  type GetFirstLinkRequest,
  type CodebaseSearchRequest,
  type SearchInitResult,
  type SearchResult,
  type GetFirstLinkResult,
  type CodebaseSearchResult,
  // History Notification Types
  type SummarizePreviousConversationRequestNotification,
  type SummarizePreviousConversationResultNotification,
  type SummarizeCurrentMessageRequestNotification,
  type SummarizeCurrentMessageResultNotification,
  // Code Utils Notification Types
  type GrepSearchRequestNotification,
  type GrepSearchResponseNotification,
  type GlobSearchRequestNotification,
  type GlobSearchResponseNotification,
  // Todo Notification Types
  type AddTodoRequestNotification,
  type AddTodoResponseNotification,
  type GetTodoRequestNotification,
  type GetTodoTasksResponseNotification,
  type EditTodoTaskRequestNotification,
  type EditTodoTaskResponseNotification,
  // System Notification Types
  type AgentInitNotification,
  type AgentCompletionNotification
} from '../agent-to-app-ws-types';

// Import response schemas from app-to-agent-ws-schema.ts
import {
  CreateFileSuccessResponseSchema,
  CreateFileErrorResponseSchema,
  CreateFolderSuccessResponseSchema,
  CreateFolderErrorResponseSchema,
  ReadFileSuccessResponseSchema,
  ReadFileSuccessResultResponseSchema,
  UpdateFileSuccessResponseSchema,
  UpdateFileErrorResponseSchema,
  DeleteFileSuccessResponseSchema,
  DeleteFileErrorResponseSchema,
  DeleteFolderSuccessResponseSchema,
  DeleteFolderErrorResponseSchema,
  FileListSuccessResponseSchema,
  FileListErrorResponseSchema,
  SearchFilesSuccessResponseSchema,
  SearchFilesErrorResponseSchema,
  WriteToFileSuccessResponseSchema,
  WriteToFileErrorResponseSchema,
  GrepSearchSuccessResponseSchema,
  GrepSearchErrorResponseSchema,
  BrowserActionResponseDataSchema,
  NewPageResponseSchema,
  ScrollResponseSchema,
  TypeResponseSchema,
  ClickResponseSchema,
  EnterResponseSchema,
  SearchResponseSchema,
  GetUrlResponseSchema,
  GoToPageResponseSchema,
  ScreenshotResponseSchema,
  HtmlReceivedSchema,
  GetMarkdownResponseSchema,
  GetContentResponseSchema,
  GetSnapShotResponseSchema,
  GetBrowserInfoResponseSchema,
  ExtractTextResponseSchema,
  FindAgentByTaskResponseSchema,
  ListAgentsResponseSchema,
  AgentsDetailResponseSchema,
  GitInitResponseSchema,
  GitPullResponseSchema,
  GitPushResponseSchema,
  GitStatusResponseSchema,
  GitAddResponseSchema,
  GitCommitResponseSchema,
  GitCheckoutResponseSchema,
  GitBranchResponseSchema,
  GitLogsResponseSchema,
  GitDiffResponseSchema,
  GetEnabledToolBoxesResponseSchema,
  GetToolsResponseSchema,
  AddTokenResponseSchema,
  GetTokenResponseSchema,
  ChatHistoryResponseSchema,
  WaitForReplyResponseSchema,
  ConfirmationResponseSchema,
  FeedbackResponseSchema,
  GetTasksByAgentResponseSchema,
  // Additional FS Response Schemas
  ListCodeDefinitionNamesSuccessResponseSchema,
  ListCodeDefinitionNamesErrorResponseSchema,
  FileSearchSuccessResponseSchema,
  FileSearchErrorResponseSchema,
  EditFileAndApplyDiffSuccessResponseSchema,
  EditFileAndApplyDiffErrorResponseSchema,
  OpenDebugBrowserResponseSchema,
  GetProjectSettingsResponseSchema,
  GetAllFilesAsMarkdownResponseSchema,
  // Terminal service response schemas
  CommandOutputResponseSchema,
  CommandErrorResponseSchema,
  CommandFinishResponseSchema,
  TerminalInterruptResponseSchema,
  TerminalServiceResponseSchema,
  // Project service response schemas
  GetProjectPathResponseSchema,
  GetRepoMapResponseSchema,
  GetEditorFileStatusResponseSchema,
  ProjectServiceResponseSchema,
  // Task service response schemas
  TaskResponseSchema,
  AddTaskResponseSchema,
  GetTasksResponseSchema,
  UpdateTasksResponseSchema,
  DeleteTaskResponseSchema,
  AddSubTaskResponseSchema,
  UpdateSubTaskResponseSchema,
  TaskServiceResponseSchema,
  // LLM service response schemas
  LLMResponseSchema,
  LLMServiceResponseSchema,
  // State service response schemas
  GetAppStateResponseSchema,
  AddToAgentStateResponseSchema,
  GetAgentStateResponseSchema,
  GetProjectStateResponseSchema,
  UpdateProjectStateResponseSchema,
  StateServiceResponseSchema,
  // VectorDB service response schemas
  GetVectorResponseSchema,
  AddVectorItemResponseSchema,
  QueryVectorItemResponseSchema,
  QueryVectorItemsResponseSchema,
  VectorDBServiceResponseSchema,
  // Utils service response schemas
  UtilsServiceResponseSchema,
  EditFileAndApplyDiffResponseSchema,
  // Tokenizer service response schemas
  TokenizerServiceResponseSchema,
  // MCP service response schemas
  GetLocalToolBoxesResponseSchema,
  GetAvailableToolBoxesResponseSchema,
  SearchAvailableToolBoxesResponseSchema,
  ListToolsFromToolBoxesResponseSchema,
  ConfigureToolBoxResponseSchema,
  ExecuteToolResponseSchema,
  MCPServiceResponseSchema,
  // Debug service response schemas
  DebugAddLogResponseSchema,
  GetDebugLogsResponseSchema,
  DebugServiceResponseSchema,
  // DB Memory service response schemas
  MemorySetResponseSchema,
  MemoryGetResponseSchema,
  DBMemoryServiceResponseSchema,
  // Code Utils service response schemas
  GetJsTreeResponseSchema,
  MatchProblemResponseSchema,
  GetMatcherListTreeResponseSchema,
  GetMatchDetailResponseSchema,
  CodeUtilsServiceResponseSchema,

  // Crawler service response schemas
  CrawlResponseSchema,
  CrawlerServiceResponseSchema,
  GetSummarizeAllResponseSchema,
  GetSummarizeResponseSchema,
  TaskCompletionResponseSchema,
} from '../app-to-agent-ws-schema';



// Import SDK module interfaces for function typings
import {
  type FileSystemModule,
  type BrowserModule,
  type ChatModule,
  type GitModule,
  type LLMModule,
  type TerminalModule,
  type TaskModule,
  type VectorDBModule,
  type MemoryModule,
  type StateModule,
  type DebugModule,
  type TokenizerModule,
  type ProjectModule,
  type CrawlerModule,
  type MCPModule,
  type AgentModule,
  type ChatSummaryModule,
  type RAGModule,
  type KnowledgeModule,
  type CodeParsersModule,
  type OutputParsersModule,
  type NotificationModule,
  type SearchModule,
  type CodeUtilsModule
} from '../codeboltjstypes/sdktypes/index';

export const codeboltApiMapping = {
  // File System APIs
  "fs.createFile": {
    "name": "createFile",
    "description": "Creates a new file with specified content at the given path",
    "functionTypings": {} as FileSystemModule['createFile'],
    "websocketSendType": {} as CreateFileEvent,
    "websocketReceiveType": {} as CreateFileSuccessResponse | CreateFileErrorResponse,
    "websocketSendSchema": createFileEventSchema,
    "websocketReceiveSchema": z.union([CreateFileSuccessResponseSchema, CreateFileErrorResponseSchema]),
    "notificationSchemas": [fileCreateRequestNotificationSchema, fileCreateResponseNotificationSchema],
    "notificationTypes": [{} as FileCreateRequestNotification, {} as FileCreateResponseNotification]
  },
  "fs.createFolder": {
    "name": "createFolder",
    "description": "Creates a new folder at the specified path",
    "functionTypings": {} as FileSystemModule['createFolder'],
    "websocketSendType": {} as CreateFolderEvent,
    "websocketReceiveType": {} as CreateFolderSuccessResponse | CreateFolderErrorResponse,
    "websocketSendSchema": createFolderEventSchema,
    "websocketReceiveSchema": z.union([CreateFolderSuccessResponseSchema, CreateFolderErrorResponseSchema]),
    "notificationSchemas": [folderCreateRequestNotificationSchema, folderCreateResponseNotificationSchema],
    "notificationTypes": [{} as FolderCreateRequestNotification, {} as FolderCreateResponseNotification]
  },
  "fs.readFile": {
    "name": "readFile",
    "description": "Reads the content of a file from the specified path",
    "functionTypings": {} as FileSystemModule['readFile'],
    "websocketSendType": {} as ReadFileEvent,
    "websocketReceiveType": {} as ReadFileSuccessResponse | ReadFileSuccessResultResponse,
    "websocketSendSchema": readFileEventSchema,
    "websocketReceiveSchema": z.union([ReadFileSuccessResponseSchema, ReadFileSuccessResultResponseSchema]),
    "notificationSchemas": [fileReadRequestNotificationSchema, fileReadResponseNotificationSchema],
    "notificationTypes": [{} as FileReadRequestNotification, {} as FileReadResponseNotification]
  },
  "fs.updateFile": {
    "name": "updateFile",
    "description": "Updates the content of an existing file",
    "functionTypings": {} as FileSystemModule['updateFile'],
    "websocketSendType": {} as UpdateFileEvent,
    "websocketReceiveType": {} as UpdateFileSuccessResponse | UpdateFileErrorResponse,
    "websocketSendSchema": updateFileEventSchema,
    "websocketReceiveSchema": z.union([UpdateFileSuccessResponseSchema, UpdateFileErrorResponseSchema]),
    "notificationSchemas": [fileEditRequestNotificationSchema, fileEditResponseNotificationSchema],
    "notificationTypes": [{} as FileEditRequestNotification, {} as FileEditResponseNotification]
  },
  "fs.deleteFile": {
    "name": "deleteFile",
    "description": "Deletes a file from the specified path",
    "functionTypings": {} as FileSystemModule['deleteFile'],
    "websocketSendType": {} as DeleteFileEvent,
    "websocketReceiveType": {} as DeleteFileSuccessResponse | DeleteFileErrorResponse,
    "websocketSendSchema": deleteFileEventSchema,
    "websocketReceiveSchema": z.union([DeleteFileSuccessResponseSchema, DeleteFileErrorResponseSchema]),
    "notificationSchemas": [fileDeleteRequestNotificationSchema, fileDeleteResponseNotificationSchema],
    "notificationTypes": [{} as FileDeleteRequestNotification, {} as FileDeleteResponseNotification]
  },
  "fs.deleteFolder": {
    "name": "deleteFolder",
    "description": "Deletes a folder and its contents from the specified path",
    "functionTypings": {} as FileSystemModule['deleteFolder'],
    "websocketSendType": {} as DeleteFolderEvent,
    "websocketReceiveType": {} as DeleteFolderSuccessResponse | DeleteFolderErrorResponse,
    "websocketSendSchema": deleteFolderEventSchema,
    "websocketReceiveSchema": z.union([DeleteFolderSuccessResponseSchema, DeleteFolderErrorResponseSchema]),
    "notificationSchemas": [folderDeleteRequestNotificationSchema, folderDeleteResponseNotificationSchema],
    "notificationTypes": [{} as FolderDeleteRequestNotification, {} as FolderDeleteResponseNotification]
  },
  "fs.listFile": {
    "name": "listFile",
    "description": "Lists files and directories in the specified path",
    "functionTypings": {} as FileSystemModule['listFile'],
    "websocketSendType": {} as FileListEvent,
    "websocketReceiveType": {} as FileListSuccessResponse | FileListErrorResponse,
    "websocketSendSchema": fileListEventSchema,
    "websocketReceiveSchema": z.union([FileListSuccessResponseSchema, FileListErrorResponseSchema]),
    "notificationSchemas": [listDirectoryRequestNotificationSchema, listDirectoryResponseNotificationSchema],
    "notificationTypes": [{} as ListDirectoryRequestNotification, {} as ListDirectoryResponseNotification]
  },
  "fs.searchFiles": {
    "name": "searchFiles",
    "description": "Searches for files matching a pattern or query",
    "functionTypings": {} as FileSystemModule['searchFiles'],
    "websocketSendType": {} as SearchFilesEvent,
    "websocketReceiveType": {} as SearchFilesSuccessResponse | SearchFilesErrorResponse,
    "websocketSendSchema": searchFilesEventSchema,
    "websocketReceiveSchema": z.union([SearchFilesSuccessResponseSchema, SearchFilesErrorResponseSchema]),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "fs.writeToFile": {
    "name": "writeToFile",
    "description": "Writes content to a file, creating it if it doesn't exist",
    "functionTypings": {} as FileSystemModule['writeToFile'],
    "websocketSendType": {} as WriteToFileEvent,
    "websocketReceiveType": {} as WriteToFileSuccessResponse | WriteToFileErrorResponse,
    "websocketSendSchema": writeToFileEventSchema,
    "websocketReceiveSchema": z.union([WriteToFileSuccessResponseSchema, WriteToFileErrorResponseSchema]),
    "notificationSchemas": [writeToFileRequestNotificationSchema, writeToFileResponseNotificationSchema],
    "notificationTypes": [{} as WriteToFileRequestNotification, {} as WriteToFileResponseNotification]
  },
  "fs.grepSearch": {
    "name": "grepSearch",
    "description": "Performs a grep-style search across files",
    "functionTypings": {} as FileSystemModule['grepSearch'],
    "websocketSendType": {} as GrepSearchEvent,
    "websocketReceiveType": {} as GrepSearchSuccessResponse | GrepSearchErrorResponse,
    "websocketSendSchema": grepSearchEventSchema,
    "websocketReceiveSchema": z.union([GrepSearchSuccessResponseSchema, GrepSearchErrorResponseSchema]),
    "notificationSchemas": [grepSearchRequestNotificationSchema, grepSearchResponseNotificationSchema],
    "notificationTypes": [{} as GrepSearchRequestNotification, {} as GrepSearchResponseNotification]
  },

  // Browser APIs
  "browser.newPage": {
    "name": "newPage",
    "description": "Opens a new browser page or tab",
    "functionTypings": {} as BrowserModule['newPage'],
    "websocketSendType": {} as NewPageEvent,
    "websocketReceiveType": {} as BrowserActionResponseData,
    "websocketSendSchema": newPageEventSchema,
    "websocketReceiveSchema": BrowserActionResponseDataSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.getUrl": {
    "name": "getUrl",
    "description": "Retrieves the current URL of the browser's active page",
    "functionTypings": {} as BrowserModule['getUrl'],
    "websocketSendType": {} as GetUrlEvent,
    "websocketReceiveType": {} as GetUrlResponse,
    "websocketSendSchema": getUrlEventSchema,
    "websocketReceiveSchema": GetUrlResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.goToPage": {
    "name": "goToPage",
    "description": "Navigates to a specified URL",
    "functionTypings": {} as BrowserModule['goToPage'],
    "websocketSendType": {} as GoToPageEvent,
    "websocketReceiveType": {} as GoToPageResponse,
    "websocketSendSchema": goToPageEventSchema,
    "websocketReceiveSchema": GoToPageResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.screenshot": {
    "name": "screenshot",
    "description": "Takes a screenshot of the current page",
    "functionTypings": {} as BrowserModule['screenshot'],
    "websocketSendType": {} as ScreenshotEvent,
    "websocketReceiveType": {} as ScreenshotResponse,
    "websocketSendSchema": screenshotEventSchema,
    "websocketReceiveSchema": ScreenshotResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.getHTML": {
    "name": "getHTML",
    "description": "Retrieves the HTML content of the current page",
    "functionTypings": {} as BrowserModule['getHTML'],
    "websocketSendType": {} as GetHtmlEvent,
    "websocketReceiveType": {} as HtmlReceived,
    "websocketSendSchema": getHtmlEventSchema,
    "websocketReceiveSchema": HtmlReceivedSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.getMarkdown": {
    "name": "getMarkdown",
    "description": "Retrieves the Markdown content of the current page",
    "functionTypings": {} as BrowserModule['getMarkdown'],
    "websocketSendType": {} as GetMarkdownEvent,
    "websocketReceiveType": {} as GetMarkdownResponse,
    "websocketSendSchema": getMarkdownEventSchema,
    "websocketReceiveSchema": GetMarkdownResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.getPDF": {
    "name": "getPDF",
    "description": "Retrieves the PDF content of the current page",
    "functionTypings": {} as BrowserModule['getPDF'],
    "websocketSendType": {} as GetPdfEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": getPdfEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.extractText": {
    "name": "extractText",
    "description": "Extracts text content from the current page",
    "functionTypings": {} as BrowserModule['extractText'],
    "websocketSendType": {} as ExtractTextEvent,
    "websocketReceiveType": {} as ExtractTextResponse,
    "websocketSendSchema": extractTextEventSchema,
    "websocketReceiveSchema": ExtractTextResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.getContent": {
    "name": "getContent",
    "description": "Gets the content of the current page",
    "functionTypings": {} as BrowserModule['getContent'],
    "websocketSendType": {} as GetContentEvent,
    "websocketReceiveType": {} as GetContentResponse,
    "websocketSendSchema": getContentEventSchema,
    "websocketReceiveSchema": GetContentResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.click": {
    "name": "click",
    "description": "Clicks on an element in the browser",
    "functionTypings": {} as BrowserModule['click'],
    "websocketSendType": {} as ClickEvent,
    "websocketReceiveType": {} as BrowserActionResponseData,
    "websocketSendSchema": clickEventSchema,
    "websocketReceiveSchema": BrowserActionResponseDataSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.type": {
    "name": "type",
    "description": "Types text into an element",
    "functionTypings": {} as BrowserModule['type'],
    "websocketSendType": {} as TypeEvent,
    "websocketReceiveType": {} as BrowserActionResponseData,
    "websocketSendSchema": typeEventSchema,
    "websocketReceiveSchema": BrowserActionResponseDataSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.scroll": {
    "name": "scroll",
    "description": "Scrolls the page in the specified direction",
    "functionTypings": {} as BrowserModule['scroll'],
    "websocketSendType": {} as ScrollEvent,
    "websocketReceiveType": {} as BrowserActionResponseData,
    "websocketSendSchema": scrollEventSchema,
    "websocketReceiveSchema": BrowserActionResponseDataSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.enter": {
    "name": "enter",
    "description": "Presses the Enter key",
    "functionTypings": {} as BrowserModule['enter'],
    "websocketSendType": {} as EnterEvent,
    "websocketReceiveType": {} as BrowserActionResponseData,
    "websocketSendSchema": enterEventSchema,
    "websocketReceiveSchema": BrowserActionResponseDataSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.close": {
    "name": "close",
    "description": "Closes the current page/tab",
    "functionTypings": {} as BrowserModule['close'],
    "websocketSendType": {} as CloseEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": closeEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.getBrowserInfo": {
    "name": "getBrowserInfo",
    "description": "Gets information about the browser",
    "functionTypings": {} as BrowserModule['getBrowserInfo'],
    "websocketSendType": {} as GetBrowserInfoEvent,
    "websocketReceiveType": {} as GetBrowserInfoResponse,
    "websocketSendSchema": getBrowserInfoEventSchema,
    "websocketReceiveSchema": GetBrowserInfoResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.getSnapShot": {
    "name": "getSnapShot",
    "description": "Takes a snapshot of the page",
    "functionTypings": {} as BrowserModule['getSnapShot'],
    "websocketSendType": {} as GetSnapShotEvent,
    "websocketReceiveType": {} as GetSnapShotResponse,
    "websocketSendSchema": getSnapShotEventSchema,
    "websocketReceiveSchema": GetSnapShotResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.pdfToText": {
    "name": "pdfToText",
    "description": "Converts the PDF content of the current page to text",
    "functionTypings": {} as BrowserModule['pdfToText'],
    "websocketSendType": {} as PdfToTextEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": pdfToTextEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "browser.search": {
    "name": "search",
    "description": "Performs a search on the current page using a specified query",
    "functionTypings": {} as BrowserModule['search'],
    "websocketSendType": {} as SearchEvent, // SearchEvent not available
    "websocketReceiveType": {} as BrowserActionResponseData,
    "websocketSendSchema": searchEventSchema,
    "websocketReceiveSchema": BrowserActionResponseDataSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Chat APIs
  "chat.getChatHistory": {
    "name": "getChatHistory",
    "description": "Retrieves the chat history from the server",
    "functionTypings": {} as ChatModule['getChatHistory'],
    "websocketSendType": {} as GetChatHistoryEvent,
    "websocketReceiveType": {} as ChatHistoryResponse,
    "websocketSendSchema": getChatHistoryEventSchema,
    "websocketReceiveSchema": ChatHistoryResponseSchema,
    "notificationSchemas": [getChatHistoryRequestNotificationSchema, getChatHistoryResultNotificationSchema],
    "notificationTypes": [{} as GetChatHistoryRequestNotification, {} as GetChatHistoryResultNotification]
  },
  "chat.sendMessage": {
    "name": "sendMessage",
    "description": "Sends a message through the WebSocket connection",
    "functionTypings": {} as ChatModule['sendMessage'],
    "websocketSendType": {} as SendMessageEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": sendMessageEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [userMessageRequestNotificationSchema, agentTextResponseNotificationSchema],
    "notificationTypes": [{} as UserMessageRequestNotification, {} as AgentTextResponseNotification]
  },
  "chat.waitforReply": {
    "name": "waitforReply",
    "description": "Waits for a reply to a sent message",
    "functionTypings": {} as ChatModule['waitforReply'],
    "websocketSendType": {} as WaitforReplyEvent,
    "websocketReceiveType": {} as WaitForReplyResponse,
    "websocketSendSchema": waitforReplyEventSchema,
    "websocketReceiveSchema": WaitForReplyResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "chat.processStarted": {
    "name": "processStarted",
    "description": "Notifies the server that a process has started",
    "functionTypings": {} as ChatModule['processStarted'],
    "websocketSendType": {} as ProcessStartedEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": processStartedEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "chat.stopProcess": {
    "name": "stopProcess",
    "description": "Stops the ongoing process",
    "functionTypings": {} as ChatModule['stopProcess'],
    "websocketSendType": {} as ProcessStoppedEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": processStoppedEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "chat.processFinished": {
    "name": "processFinished",
    "description": "Indicates that the process has finished",
    "functionTypings": {} as ChatModule['processFinished'],
    "websocketSendType": {} as ProcessFinishedEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": processFinishedEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "chat.askQuestion": {
    "name": "askQuestion",
    "description": "Asks a question and waits for a response",
    "functionTypings": {} as ChatModule['askQuestion'],
    "websocketSendType": {} as ConfirmationRequestEvent,
    "websocketReceiveType": {} as ConfirmationResponse,
    "websocketSendSchema": confirmationRequestEventSchema,
    "websocketReceiveSchema": ConfirmationResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "chat.sendNotificationEvent": {
    "name": "sendNotificationEvent",
    "description": "Sends a notification event to the server",
    "functionTypings": {} as ChatModule['sendNotificationEvent'],
    "websocketSendType": {} as NotificationEvent,
    "websocketReceiveType": {} as unknown as void,
    "websocketSendSchema": notificationEventSchema,
    "websocketReceiveSchema": z.void(),
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Agent APIs
  "agent.findAgent": {
    "name": "findAgent",
    "description": "Finds an agent by criteria",
    "functionTypings": {} as AgentModule['findAgent'],
    "websocketSendType": {} as FindAgentEvent,
    "websocketReceiveType": {} as FindAgentByTaskResponse,
    "websocketSendSchema": findAgentEventSchema,
    "websocketReceiveSchema": FindAgentByTaskResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "agent.startAgent": {
    "name": "startAgent",
    "description": "Starts an agent",
    "functionTypings": {} as AgentModule['startAgent'],
    "websocketSendType": {} as StartAgentEvent,
    "websocketReceiveType": {} as TaskCompletionResponse,
    "websocketSendSchema": startAgentEventSchema,
    "websocketReceiveSchema": TaskCompletionResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "agent.getAgentsList": {
    "name": "getAgentsList",
    "description": "Gets a list of all agents",
    "functionTypings": {} as AgentModule['getAgentsList'],
    "websocketSendType": {} as ListAgentsEvent,
    "websocketReceiveType": {} as ListAgentsResponse,
    "websocketSendSchema": listAgentsEventSchema,
    "websocketReceiveSchema": ListAgentsResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "agent.getAgentsDetail": {
    "name": "getAgentsDetail",
    "description": "Gets details of a specific agent",
    "functionTypings": {} as AgentModule['getAgentsDetail'],
    "websocketSendType": {} as GetAgentsDetailEvent,
    "websocketReceiveType": {} as AgentsDetailResponse,
    "websocketSendSchema": getAgentsDetailEventSchema,
    "websocketReceiveSchema": AgentsDetailResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Git APIs
  "git.init": {
    "name": "init",
    "description": "Initializes a new Git repository",
    "functionTypings": {} as GitModule['init'],
    "websocketSendType": {} as GitInitEvent,
    "websocketReceiveType": {} as GitInitResponse,
    "websocketSendSchema": gitInitEventSchema,
    "websocketReceiveSchema": GitInitResponseSchema,
    "notificationSchemas": [gitInitRequestNotificationSchema, gitInitResponseNotificationSchema],
    "notificationTypes": [{} as GitInitRequestNotification, {} as GitInitResponseNotification]
  },
  "git.addAll": {
    "name": "addAll",
    "description": "Adds all changes in the local repository to the staging area",
    "functionTypings": {} as GitModule['addAll'],
    "websocketSendType": {} as GitAddEvent,
    "websocketReceiveType": {} as GitAddResponse,
    "websocketSendSchema": gitAddEventSchema,
    "websocketReceiveSchema": GitAddResponseSchema,
    "notificationSchemas": [gitAddRequestNotificationSchema, gitAddResponseNotificationSchema],
    "notificationTypes": [{} as GitAddRequestNotification, {} as GitAddResponseNotification]
  },
  "git.commit": {
    "name": "commit",
    "description": "Commits staged changes",
    "functionTypings": {} as GitModule['commit'],
    "websocketSendType": {} as GitCommitEvent,
    "websocketReceiveType": {} as GitCommitResponse,
    "websocketSendSchema": gitCommitEventSchema,
    "websocketReceiveSchema": GitCommitResponseSchema,
    "notificationSchemas": [gitCommitRequestNotificationSchema, gitCommitResponseNotificationSchema],
    "notificationTypes": [{} as GitCommitRequestNotification, {} as GitCommitResponseNotification]
  },
  "git.push": {
    "name": "push",
    "description": "Pushes changes to remote repository",
    "functionTypings": {} as GitModule['push'],
    "websocketSendType": {} as GitPushEvent,
    "websocketReceiveType": {} as GitPushResponse,
    "websocketSendSchema": gitPushEventSchema,
    "websocketReceiveSchema": GitPushResponseSchema,
    "notificationSchemas": [gitPushRequestNotificationSchema, gitPushResponseNotificationSchema],
    "notificationTypes": [{} as GitPushRequestNotification, {} as GitPushResponseNotification]
  },
  "git.pull": {
    "name": "pull",
    "description": "Pulls changes from remote repository",
    "functionTypings": {} as GitModule['pull'],
    "websocketSendType": {} as GitPullEvent,
    "websocketReceiveType": {} as GitPullResponse,
    "websocketSendSchema": gitPullEventSchema,
    "websocketReceiveSchema": GitPullResponseSchema,
    "notificationSchemas": [gitPullRequestNotificationSchema, gitPullResponseNotificationSchema],
    "notificationTypes": [{} as GitPullRequestNotification, {} as GitPullResponseNotification]
  },
  "git.status": {
    "name": "status",
    "description": "Gets the status of the repository",
    "functionTypings": {} as GitModule['status'],
    "websocketSendType": {} as GitStatusEvent,
    "websocketReceiveType": {} as GitStatusResponse,
    "websocketSendSchema": gitStatusEventSchema,
    "websocketReceiveSchema": GitStatusResponseSchema,
    "notificationSchemas": [gitStatusRequestNotificationSchema, gitStatusResponseNotificationSchema],
    "notificationTypes": [{} as GitStatusRequestNotification, {} as GitStatusResponseNotification]
  },
  "git.checkout": {
    "name": "checkout",
    "description": "Switches to a different branch",
    "functionTypings": {} as GitModule['checkout'],
    "websocketSendType": {} as GitCheckoutEvent,
    "websocketReceiveType": {} as GitCheckoutResponse,
    "websocketSendSchema": gitCheckoutEventSchema,
    "websocketReceiveSchema": GitCheckoutResponseSchema,
    "notificationSchemas": [gitCheckoutRequestNotificationSchema, gitCheckoutResponseNotificationSchema],
    "notificationTypes": [{} as GitCheckoutRequestNotification, {} as GitCheckoutResponseNotification]
  },
  "git.branch": {
    "name": "branch",
    "description": "Creates a new branch",
    "functionTypings": {} as GitModule['branch'],
    "websocketSendType": {} as GitBranchEvent,
    "websocketReceiveType": {} as GitBranchResponse,
    "websocketSendSchema": gitBranchEventSchema,
    "websocketReceiveSchema": GitBranchResponseSchema,
    "notificationSchemas": [gitBranchRequestNotificationSchema, gitBranchResponseNotificationSchema],
    "notificationTypes": [{} as GitBranchRequestNotification, {} as GitBranchResponseNotification]
  },
  "git.logs": {
    "name": "logs",
    "description": "Retrieves the commit logs",
    "functionTypings": {} as GitModule['logs'],
    "websocketSendType": {} as GitLogsEvent,
    "websocketReceiveType": {} as GitLogsResponse,
    "websocketSendSchema": gitLogsEventSchema,
    "websocketReceiveSchema": GitLogsResponseSchema,
    "notificationSchemas": [gitLogsRequestNotificationSchema, gitLogsResponseNotificationSchema],
    "notificationTypes": [{} as GitLogsRequestNotification, {} as GitLogsResponseNotification]
  },
  "git.diff": {
    "name": "diff",
    "description": "Gets the diff of changes for a specific commit",
    "functionTypings": {} as GitModule['diff'],
    "websocketSendType": {} as GitDiffEvent,
    "websocketReceiveType": {} as GitDiffResponse,
    "websocketSendSchema": gitDiffEventSchema,
    "websocketReceiveSchema": GitDiffResponseSchema,
    "notificationSchemas": [gitDiffRequestNotificationSchema, gitDiffResponseNotificationSchema],
    "notificationTypes": [{} as GitDiffRequestNotification, {} as GitDiffResponseNotification]
  },

  // LLM APIs
  "llm.inference": {
    "name": "inference",
    "description": "Performs LLM inference",
    "functionTypings": {} as LLMModule['inference'],
    "websocketSendType": {} as InferenceEvent,
    "websocketReceiveType": {} as LLMResponse,
    "websocketSendSchema": inferenceEventSchema,
    "websocketReceiveSchema": LLMResponseSchema,
    "notificationSchemas": [llmRequestNotificationSchema, llmResponseNotificationSchema],
    "notificationTypes": [{} as LlmRequestNotification, {} as LlmResponseNotification]
  },
  "llm.legacyInference": {
    "name": "legacyInference",
    "description": "Legacy method for backward compatibility - converts simple string prompt to message format",
    "functionTypings": {} as LLMModule['legacyInference'],
    "websocketSendType": {} as InferenceEvent,
    "websocketReceiveType": {} as LLMResponse,
    "websocketSendSchema": inferenceEventSchema,
    "websocketReceiveSchema": LLMResponseSchema,
    "notificationSchemas": [llmRequestNotificationSchema, llmResponseNotificationSchema],
    "notificationTypes": [{} as LlmRequestNotification, {} as LlmResponseNotification]
  },

  // Terminal APIs
  "terminal.executeCommand": {
    "name": "executeCommand",
    "description": "Executes a given command and returns the result",
    "functionTypings": {} as TerminalModule['executeCommand'],
    "websocketSendType": {} as ExecuteCommandEvent,
    "websocketReceiveType": {} as CommandOutputResponse | CommandErrorResponse,
    "websocketSendSchema": executeCommandEventSchema,
    "websocketReceiveSchema": z.union([CommandOutputResponseSchema, CommandErrorResponseSchema]),
    "notificationSchemas": [commandExecutionRequestNotificationSchema, commandExecutionResponseNotificationSchema],
    "notificationTypes": [{} as CommandExecutionRequestNotification, {} as CommandExecutionResponseNotification]
  },
  "terminal.executeCommandRunUntilError": {
    "name": "executeCommandRunUntilError",
    "description": "Executes a given command and keeps running until an error occurs",
    "functionTypings": {} as TerminalModule['executeCommandRunUntilError'],
    "websocketSendType": {} as ExecuteCommandRunUntilErrorEvent,
    "websocketReceiveType": {} as CommandErrorResponse,
    "websocketSendSchema": executeCommandRunUntilErrorEventSchema,
    "websocketReceiveSchema": CommandErrorResponseSchema,
    "notificationSchemas": [commandExecutionRequestNotificationSchema, commandExecutionResponseNotificationSchema],
    "notificationTypes": [{} as CommandExecutionRequestNotification, {} as CommandExecutionResponseNotification]
  },
  "terminal.sendManualInterrupt": {
    "name": "sendManualInterrupt", 
    "description": "Sends a manual interrupt signal to the terminal",
    "functionTypings": {} as TerminalModule['sendManualInterrupt'],
    "websocketSendType": {} as SendInterruptToTerminalEvent,
    "websocketReceiveType": {} as TerminalInterruptResponse,
    "websocketSendSchema": sendInterruptToTerminalEventSchema,
    "websocketReceiveSchema": TerminalInterruptResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "terminal.executeCommandWithStream": {
    "name": "executeCommandWithStream",
    "description": "Executes a given command and streams the output",
    "functionTypings": {} as TerminalModule['executeCommandWithStream'],
    "websocketSendType": {} as ExecuteCommandWithStreamEvent,
    "websocketReceiveType": {} as CommandOutputResponse | CommandErrorResponse | CommandFinishResponse,
    "websocketSendSchema": executeCommandWithStreamEventSchema,
    "websocketReceiveSchema": z.union([CommandOutputResponseSchema, CommandErrorResponseSchema, CommandFinishResponseSchema]),
    "notificationSchemas": [commandExecutionRequestNotificationSchema, commandExecutionResponseNotificationSchema],
    "notificationTypes": [{} as CommandExecutionRequestNotification, {} as CommandExecutionResponseNotification]
  },

  // Task APIs
  "taskplaner.addTask": {
    "name": "addTask",
    "description": "Adds a new task with enhanced parameters",
    "functionTypings": {} as TaskModule['addTask'],
    "websocketSendType": {} as AddTaskEvent,
    "websocketReceiveType": {} as AddTaskResponse,
    "websocketSendSchema": addTaskEventSchema,
    "websocketReceiveSchema": AddTaskResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "taskplaner.addSimpleTask": {
    "name": "addSimpleTask", 
    "description": "Adds a task using simple string parameter (legacy support)",
    "functionTypings": {} as TaskModule['addSimpleTask'],
    "websocketSendType": {} as AddTaskEvent,
    "websocketReceiveType": {} as AddTaskResponse,
    "websocketSendSchema": addTaskEventSchema,
    "websocketReceiveSchema": AddTaskResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "taskplaner.getTasks": {
    "name": "getTasks",
    "description": "Gets all tasks with optional filtering",
    "functionTypings": {} as TaskModule['getTasks'],
    "websocketSendType": {} as GetTasksEvent,
    "websocketReceiveType": {} as GetTasksResponse,
    "websocketSendSchema": getTasksEventSchema,
    "websocketReceiveSchema": GetTasksResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "taskplaner.updateTask": {
    "name": "updateTask",
    "description": "Updates an existing task",
    "functionTypings": {} as TaskModule['updateTask'],
    "websocketSendType": {} as UpdateTaskEvent,
    "websocketReceiveType": {} as UpdateTasksResponse,
    "websocketSendSchema": updateTaskEventSchema,
    "websocketReceiveSchema": UpdateTasksResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "taskplaner.deleteTask": {
    "name": "deleteTask",
    "description": "Deletes a task",
    "functionTypings": {} as TaskModule['deleteTask'],
    "websocketSendType": {} as DeleteTaskEvent,
    "websocketReceiveType": {} as DeleteTaskResponse,
    "websocketSendSchema": deleteTaskEventSchema,
    "websocketReceiveSchema": DeleteTaskResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "taskplaner.addSubTask": {
    "name": "addSubTask",
    "description": "Adds a subtask to an existing task",
    "functionTypings": {} as TaskModule['addSubTask'],
    "websocketSendType": {} as AddSubTaskEvent,
    "websocketReceiveType": {} as AddSubTaskResponse,
    "websocketSendSchema": addSubTaskEventSchema,
    "websocketReceiveSchema": AddSubTaskResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "taskplaner.updateSubTask": {
    "name": "updateSubTask",
    "description": "Updates a subtask",
    "functionTypings": {} as TaskModule['updateSubTask'],
    "websocketSendType": {} as UpdateSubTaskEvent,
    "websocketReceiveType": {} as UpdateSubTaskResponse,
    "websocketSendSchema": updateSubTaskEventSchema,
    "websocketReceiveSchema": UpdateSubTaskResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Vector Database APIs
  "vectordb.addVectorItem": {
    "name": "addVectorItem",
    "description": "Adds a vector item to the database",
    "functionTypings": {} as VectorDBModule['addVectorItem'],
    "websocketSendType": {} as AddVectorItemEvent,
    "websocketReceiveType": {} as AddVectorItemResponse,
    "websocketSendSchema": addVectorItemEventSchema,
    "websocketReceiveSchema": AddVectorItemResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "vectordb.getVector": {
    "name": "getVector",
    "description": "Retrieves a vector from the vector database based on the provided key",
    "functionTypings": {} as VectorDBModule['getVector'],
    "websocketSendType": {} as GetVectorEvent,
    "websocketReceiveType": {} as GetVectorResponse,
    "websocketSendSchema": getVectorEventSchema,
    "websocketReceiveSchema": GetVectorResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "vectordb.queryVectorItem": {
    "name": "queryVectorItem",
    "description": "Queries a vector item from the database based on the provided key",
    "functionTypings": {} as VectorDBModule['queryVectorItem'],
    "websocketSendType": {} as QueryVectorItemEvent,
    "websocketReceiveType": {} as QueryVectorItemResponse,
    "websocketSendSchema": queryVectorItemEventSchema,
    "websocketReceiveSchema": QueryVectorItemResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "vectordb.queryVectorItems": {
    "name": "queryVectorItems",
    "description": "Queries multiple vector items from the database",
    "functionTypings": {} as VectorDBModule['queryVectorItems'],
    "websocketSendType": {} as QueryVectorItemsEvent,
    "websocketReceiveType": {} as QueryVectorItemsResponse,
    "websocketSendSchema": queryVectorItemsEventSchema,
    "websocketReceiveSchema": QueryVectorItemsResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Memory APIs  
  "dbmemory.set": {
    "name": "set",
    "description": "Sets a memory value",
    "functionTypings": {} as MemoryModule['set'],
    "websocketSendType": {} as MemorySetEvent,
    "websocketReceiveType": {} as MemorySetResponse,
    "websocketSendSchema": memorySetEventSchema,
    "websocketReceiveSchema": MemorySetResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "dbmemory.get": {
    "name": "get",
    "description": "Gets a memory value",
    "functionTypings": {} as MemoryModule['get'],
    "websocketSendType": {} as MemoryGetEvent,
    "websocketReceiveType": {} as MemoryGetResponse,
    "websocketSendSchema": memoryGetEventSchema,
    "websocketReceiveSchema": MemoryGetResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // State APIs
  "cbstate.getApplicationState": {
    "name": "getApplicationState",
    "description": "Gets application state",
    "functionTypings": {} as StateModule['getState'],
    "websocketSendType": {} as GetApplicationStateEvent,
    "websocketReceiveType": {} as GetAppStateResponse,
    "websocketSendSchema": getApplicationStateEventSchema,
    "websocketReceiveSchema": GetAppStateResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "cbstate.addToAgentState": {
    "name": "addToAgentState",
    "description": "Adds to agent state",
    "functionTypings": {} as StateModule['addToAgentState'],
    "websocketSendType": {} as AddToAgentStateEvent,
    "websocketReceiveType": {} as AddToAgentStateResponse,
    "websocketSendSchema": addToAgentStateEventSchema,
    "websocketReceiveSchema": AddToAgentStateResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "cbstate.getAgentState": {
    "name": "getAgentState",
    "description": "Gets agent state",
    "functionTypings": {} as StateModule['getAgentState'],
    "websocketSendType": {} as GetAgentStateEvent,
    "websocketReceiveType": {} as GetAgentStateResponse,
    "websocketSendSchema": getAgentStateEventSchema,
    "websocketReceiveSchema": GetAgentStateResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "cbstate.getProjectState": {
    "name": "getProjectState",
    "description": "Gets project state",
    "functionTypings": {} as StateModule['getProjectState'],
    "websocketSendType": {} as GetProjectStateEvent,
    "websocketReceiveType": {} as GetProjectStateResponse,
    "websocketSendSchema": getProjectStateEventSchema,
    "websocketReceiveSchema": GetProjectStateResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "cbstate.updateProjectState": {
    "name": "updateProjectState",
    "description": "Updates project state",
    "functionTypings": {} as StateModule['updateProjectState'],
    "websocketSendType": {} as UpdateProjectStateEvent,
    "websocketReceiveType": {} as UpdateProjectStateResponse,
    "websocketSendSchema": updateProjectStateEventSchema,
    "websocketReceiveSchema": UpdateProjectStateResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Debug APIs
  "debug.log": {
    "name": "log",
    "description": "Logs a debug message",
    "functionTypings": {} as any, // DebugModule['log'] - method exists but property name differs
    "websocketSendType": {} as AddLogEvent,
    "websocketReceiveType": {} as DebugAddLogResponse,
    "websocketSendSchema": addLogEventSchema,
    "websocketReceiveSchema": DebugAddLogResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Tokenizer APIs
  "tokenizer.tokenize": {
    "name": "tokenize",
    "description": "Tokenizes text",
    "functionTypings": {} as TokenizerModule['tokenize'],
    "websocketSendType": {} as AddTokenEvent,
    "websocketReceiveType": {} as AddTokenResponse,
    "websocketSendSchema": addTokenEventSchema,
    "websocketReceiveSchema": AddTokenResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "tokenizer.countTokens": {
    "name": "countTokens",
    "description": "Counts tokens in text",
    "functionTypings": {} as TokenizerModule['countTokens'],
    "websocketSendType": {} as GetTokenEvent,
    "websocketReceiveType": {} as GetTokenResponse,
    "websocketSendSchema": getTokenEventSchema,
    "websocketReceiveSchema": GetTokenResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Project APIs
  "project.getProjectPath": {
    "name": "getProjectPath",
    "description": "Gets project information",
    "functionTypings": {} as ProjectModule['getProjectPath'],
    "websocketSendType": {} as GetProjectPathEvent,
    "websocketReceiveType": {} as GetProjectPathResponse,
    "websocketSendSchema": getProjectPathEventSchema,
    "websocketReceiveSchema": GetProjectPathResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Crawler APIs
  // "crawler.crawl": {
  //   "name": "crawl",
  //   "description": "Crawls a website",
  //   "functionTypings": {} as CrawlerModule['crawl'],
  //   "websocketSendType": {} as StartCrawlerEvent,
  //   "websocketReceiveType": {} as CrawlerResponse,
  //   "websocketSendSchema": startCrawlerEventSchema,
  //   "websocketReceiveSchema": CrawlerResponseSchema,
  //   "notificationSchemas": [],
  //   "notificationTypes": []
  // },

  // MCP APIs
  "mcp.listMcpFromServers": {
    "name": "listMcpFromServers",
    "description": "Lists available MCP tools from servers",
    "functionTypings": {} as MCPModule['listMcpFromServers'],
    "websocketSendType": {} as GetEnabledToolBoxesEvent,
    "websocketReceiveType": {} as GetEnabledToolBoxesResponse,
    "websocketSendSchema": getEnabledToolBoxesEventSchema,
    "websocketReceiveSchema": GetEnabledToolBoxesResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "mcp.getTools": {
    "name": "getTools",
    "description": "Gets tools from MCPs",
    "functionTypings": {} as MCPModule['getTools'],
    "websocketSendType": {} as GetToolsEvent,
    "websocketReceiveType": {} as GetToolsResponse,
    "websocketSendSchema": getToolsEventSchema,
    "websocketReceiveSchema": GetToolsResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "mcp.executeTool": {
    "name": "executeTool",
    "description": "Executes an MCP tool",
    "functionTypings": {} as MCPModule['executeTool'],
    "websocketSendType": {} as ExecuteToolEvent,
    "websocketReceiveType": {} as ExecuteToolResponse,
    "websocketSendSchema": executeToolEventSchema,
    "websocketReceiveSchema": ExecuteToolResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Chat Summary APIs
  "chatSummary.summarizeAll": {
    "name": "summarizeAll",
    "description": "Summarizes the entire chat history",
    "functionTypings": {} as ChatSummaryModule['summarizeAll'],
    "websocketSendType": {} as SummarizeAllEvent,
    "websocketReceiveType": {} as GetSummarizeAllResponse,
    "websocketSendSchema": summarizeAllEventSchema,
    "websocketReceiveSchema": GetSummarizeAllResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "chatSummary.summarize": {
    "name": "summarize",
    "description": "Summarizes a specific part of the chat history",
    "functionTypings": {} as ChatSummaryModule['summarize'],
    "websocketSendType": {} as SummarizeEvent,
    "websocketReceiveType": {} as GetSummarizeResponse,
    "websocketSendSchema": summarizeEventSchema,
    "websocketReceiveSchema": GetSummarizeResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "fs.listCodeDefinitionNames": {
    "name": "listCodeDefinitionNames",
    "description": "Lists all code definition names in the project",
    "functionTypings": {} as any, // FileSystemModule['listCodeDefinitionNames'] - method exists but not in current SDK types
    "websocketSendType": {} as ListCodeDefinitionNamesEvent,
    "websocketReceiveType": {} as ListCodeDefinitionNamesSuccessResponse | ListCodeDefinitionNamesErrorResponse,
    "websocketSendSchema": listCodeDefinitionNamesEventSchema,
    "websocketReceiveSchema": z.union([ListCodeDefinitionNamesSuccessResponseSchema, ListCodeDefinitionNamesErrorResponseSchema]),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  // "fs.searchFiles": {
  //   "name": "searchFiles",
  //   "websocketSendType": "SearchFilesEvent", 
  //   "websocketSendSchema": "searchFilesEventSchema",
  //   "websocketReceiveType": "SearchFilesSuccessResponse | SearchFilesErrorResponse",
  //   "websocketReceiveSchema": "z.union([SearchFilesSuccessResponseSchema, SearchFilesErrorResponseSchema])"
  // },
  // "fs.writeToFile": {
  //   "name": "writeToFile",
  //   "websocketSendType": "FsEvent",
  //   "websocketSendSchema": "fsEventBaseSchema",
  //   "websocketReceiveType": "WriteToFileSuccessResponse | WriteToFileErrorResponse",
  //   "websocketReceiveSchema": "z.union([WriteToFileSuccessResponseSchema, WriteToFileErrorResponseSchema])"
  // },
  // "fs.grepSearch": {
  //   "name": "grepSearch", 
  //   "websocketSendType": "FsEvent",
  //   "websocketSendSchema": "fsEventBaseSchema",
  //   "websocketReceiveType": "GrepSearchSuccessResponse | GrepSearchErrorResponse",
  //   "websocketReceiveSchema": "z.union([GrepSearchSuccessResponseSchema, GrepSearchErrorResponseSchema])"
  // },
  "fs.fileSearch": {
    "name": "fileSearch",
    "description": "Searches for files matching specified criteria",
    "functionTypings": {} as any, // FileSystemModule['fileSearch'] - method exists but not in current SDK types
    "websocketSendType": {} as FileSearchEvent,
    "websocketReceiveType": {} as FileSearchSuccessResponse | FileSearchErrorResponse,
    "websocketSendSchema": fileSearchEventSchema,
    "websocketReceiveSchema": z.union([FileSearchSuccessResponseSchema, FileSearchErrorResponseSchema]),
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "fs.editFileAndApplyDiff": {
    "name": "editFileAndApplyDiff",
    "description": "Edits a file by applying a diff patch",
    "functionTypings": {} as any, // FileSystemModule['editFileWithDiff'] - method exists but not in current SDK types
    "websocketSendType": {} as EditFileWithDiffEvent,
    "websocketReceiveType": {} as EditFileAndApplyDiffSuccessResponse | EditFileAndApplyDiffErrorResponse,
    "websocketSendSchema": editFileWithDiffEventSchema,
    "websocketReceiveSchema": z.union([EditFileAndApplyDiffSuccessResponseSchema, EditFileAndApplyDiffErrorResponseSchema]),
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Browser APIs
  // "browser.newPage": {
  //   "name": "newPage",
  //   "websocketSendType": "NewPageEvent",
  //   "websocketSendSchema": "newPageEventSchema",
  //   "websocketReceiveType": "NewPageResponse", 
  //   "websocketReceiveSchema": "newPageResponseSchema"
  // },
  // "browser.getUrl": {
  //   "name": "getUrl",
  //   "websocketSendType": "GetUrlEvent",
  //   "websocketSendSchema": "getUrlEventSchema",
  //   "websocketReceiveType": "BrowserActionResponseData",
  //   "websocketReceiveSchema": "browserActionResponseDataSchema"
  // },
  // "browser.goToPage": {
  //   "name": "goToPage",
  //   "websocketSendType": "GoToPageEvent", 
  //   "websocketSendSchema": "goToPageEventSchema",
  //   "websocketReceiveType": "GoToPageResponse",
  //   "websocketReceiveSchema": "goToPageResponseSchema"
  // },
  // "browser.screenshot": {
  //   "name": "screenshot",
  //   "websocketSendType": "ScreenshotEvent",
  //   "websocketSendSchema": "screenshotEventSchema",
  //   "websocketReceiveType": "BrowserScreenshotResponse",
  //   "websocketReceiveSchema": "browserScreenshotResponseSchema"
  // },
  // "browser.getHTML": {
  //   "name": "getHTML",
  //   "websocketSendType": "GetHtmlEvent",
  //   "websocketSendSchema": "getHtmlEventSchema", 
  //   "websocketReceiveType": "HtmlReceived",
  //   "websocketReceiveSchema": "htmlReceivedSchema"
  // },
  // "browser.getMarkdown": {
  //   "name": "getMarkdown",
  //   "websocketSendType": "GetMarkdownEvent",
  //   "websocketSendSchema": "getMarkdownEventSchema",
  //   "websocketReceiveType": "GetMarkdownResponse",
  //   "websocketReceiveSchema": "getMarkdownResponseSchema"
  // },
  // "browser.getPDF": {
  //   "name": "getPDF",
  //   "websocketSendType": "GetPdfEvent",
  //   "websocketSendSchema": "getPdfEventSchema", 
  //   "websocketReceiveType": "void",
  //   "websocketReceiveSchema": "void"
  // },
  // "browser.extractText": {
  //   "name": "extractText",
  //   "websocketSendType": "ExtractTextEvent",
  //   "websocketSendSchema": "extractTextEventSchema",
  //   "websocketReceiveType": "ExtractTextResponse",
  //   "websocketReceiveSchema": "extractTextResponseSchema"
  // },
  // "browser.getContent": {
  //   "name": "getContent",
  //   "websocketSendType": "GetContentEvent", 
  //   "websocketSendSchema": "getContentEventSchema",
  //   "websocketReceiveType": "GetContentResponse",
  //   "websocketReceiveSchema": "getContentResponseSchema"
  // },
  // "browser.click": {
  //   "name": "click",
  //   "websocketSendType": "ClickEvent",
  //   "websocketSendSchema": "clickEventSchema",
  //   "websocketReceiveType": "BrowserActionResponseData",
  //   "websocketReceiveSchema": "browserActionResponseDataSchema"
  // },
  // "browser.type": {
  //   "name": "type",
  //   "websocketSendType": "TypeTextEvent",
  //   "websocketSendSchema": "typeTextEventSchema", 
  //   "websocketReceiveType": "BrowserActionResponseData",
  //   "websocketReceiveSchema": "browserActionResponseDataSchema"
  // },
  // "browser.scroll": {
  //   "name": "scroll",
  //   "websocketSendType": "ScrollEvent",
  //   "websocketSendSchema": "scrollEventSchema",
  //   "websocketReceiveType": "BrowserActionResponseData",
  //   "websocketReceiveSchema": "browserActionResponseDataSchema"
  // },
  // "browser.wait": {
  //   "name": "wait",
  //   "description": "Waits for a specified duration or condition",
  //   "functionTypings": {} as any, // BrowserModule['wait'] - method exists but not in current SDK types
  //   "websocketSendType": null, // WaitEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // waitEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },
  // "browser.evaluate": {
  //   "name": "evaluate",
  //   "description": "Evaluates JavaScript code in the browser context",
  //   "functionTypings": {} as any, // BrowserModule['evaluate'] - method exists but not in current SDK types
  //   "websocketSendType": null, // EvaluateEvent not available in current schema exports
  //   "websocketReceiveType": {} as { result: any },
  //   "websocketSendSchema": null, // evaluateEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ result: z.any() })
  // },
  // "browser.getElementInfo": {
  //   "name": "getElementInfo",
  //   "description": "Gets information about a browser element",
  //   "functionTypings": {} as any, // BrowserModule['getElementInfo'] - method exists but not in current SDK types
  //   "websocketSendType": null, // GetElementInfoEvent not available in current schema exports
  //   "websocketReceiveType": {} as { info: any },
  //   "websocketSendSchema": null, // getElementInfoEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ info: z.any() })
  // },
  // "browser.takeElementScreenshot": {
  //   "name": "takeElementScreenshot",
  //   "description": "Takes a screenshot of a specific element",
  //   "functionTypings": {} as any, // BrowserModule['takeElementScreenshot'] - method exists but not in current SDK types
  //   "websocketSendType": null, // TakeElementScreenshotEvent not available in current schema exports
  //   "websocketReceiveType": {} as { screenshot: string },
  //   "websocketSendSchema": null, // takeElementScreenshotEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ screenshot: z.string() })
  // },
  // "browser.setViewport": {
  //   "name": "setViewport",
  //   "description": "Sets the browser viewport size",
  //   "functionTypings": {} as any, // BrowserModule['setViewport'] - method exists but not in current SDK types
  //   "websocketSendType": null, // SetViewportEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // setViewportEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },
  // "browser.reloadPage": {
  //   "name": "reloadPage",
  //   "description": "Reloads the current browser page",
  //   "functionTypings": {} as any, // BrowserModule['reloadPage'] - method exists but not in current SDK types
  //   "websocketSendType": null, // ReloadPageEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // reloadPageEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },
  // "browser.goBack": {
  //   "name": "goBack",
  //   "description": "Navigates back in browser history",
  //   "functionTypings": {} as any, // BrowserModule['goBack'] - method exists but not in current SDK types
  //   "websocketSendType": null, // GoBackEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // goBackEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },
  // "browser.goForward": {
  //   "name": "goForward",
  //   "description": "Navigates forward in browser history",
  //   "functionTypings": {} as any, // BrowserModule['goForward'] - method exists but not in current SDK types
  //   "websocketSendType": null, // GoForwardEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // goForwardEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },
  // "browser.closeBrowser": {
  //   "name": "closeBrowser",
  //   "description": "Closes the browser",
  //   "functionTypings": {} as any, // BrowserModule['closeBrowser'] - method exists but not in current SDK types
  //   "websocketSendType": null, // CloseBrowserEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // closeBrowserEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },
  // "browser.getSnapshot": {
  //   "name": "getSnapshot",
  //   "description": "Gets a snapshot of the current page",
  //   "functionTypings": {} as BrowserModule['getSnapShot'],
  //   "websocketSendType": null, // BrowserEvent not available in current schema exports
  //   "websocketReceiveType": {} as { snapshot: any },
  //   "websocketSendSchema": null, // browserEventBaseSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ snapshot: z.any() })
  // },

  // Chat APIs
  // "chat.getChatHistory": {
  //   "name": "getChatHistory",
  //   "websocketSendType": "GetChatHistoryEvent",
  //   "websocketSendSchema": "getChatHistoryEventSchema",
  //   "websocketReceiveType": "GetChatHistoryResponse",
  //   "websocketReceiveSchema": "getChatHistoryResponseSchema"
  // },
  // "chat.sendMessage": {
  //   "name": "sendMessage",
  //   "websocketSendType": "SendMessageEvent", 
  //   "websocketSendSchema": "sendMessageEventSchema",
  //   "websocketReceiveType": "void",
  //   "websocketReceiveSchema": "void"
  // },
  // "chat.waitforReply": {
  //   "name": "waitforReply",
  //   "websocketSendType": "ChatEvent",
  //   "websocketSendSchema": "chatEventBaseSchema",
  //   "websocketReceiveType": "UserMessage",
  //   "websocketReceiveSchema": "userMessageSchema"
  // },
  // "chat.processStarted": {
  //   "name": "processStarted",
  //   "websocketSendType": "ProcessStoppedEvent", 
  //   "websocketSendSchema": "processStoppedEventSchema",
  //   "websocketReceiveType": "ProcessStoppedResponse",
  //   "websocketReceiveSchema": "processStoppedResponseSchema"
  // },
  // "chat.askQuestion": {
  //   "name": "askQuestion",
  //   "websocketSendType": "ChatEvent",
  //   "websocketSendSchema": "chatEventBaseSchema",
  //   "websocketReceiveType": "string",
  //   "websocketReceiveSchema": "z.string()"
  // },
  // "chat.askQuestionWithChoices": {
  //   "name": "askQuestionWithChoices",
  //   "description": "Asks a question with multiple choice options",
  //   "functionTypings": {} as any, // ChatModule['askQuestionWithChoices'] - method exists but not in current SDK types
  //   "websocketSendType": null, // ChatEvent not available as generic type
  //   "websocketReceiveType": {} as string,
  //   "websocketSendSchema": null, // chatEventBaseSchema not available
  //   "websocketReceiveSchema": z.string()
  // },
  "chat.sendConfirmationRequest": {
    "name": "sendConfirmationRequest",
    "description": "Sends a confirmation request to the user",
    "functionTypings": {} as ChatModule['sendConfirmationRequest'], 
    "websocketSendType": {} as ConfirmationRequestEvent,
    "websocketReceiveType": {} as ConfirmationResponse,
    "websocketSendSchema": confirmationRequestEventSchema,
    "websocketReceiveSchema": ConfirmationResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Agent APIs
  // "agent.findAgent": {
  //   "name": "findAgent",
  //   "websocketSendType": "FindAgentEvent", 
  //   "websocketSendSchema": "findAgentEventSchema",
  //   "websocketReceiveType": "FindAgentByTaskResponse",
  //   "websocketReceiveSchema": "findAgentByTaskResponseSchema"
  // },
  // "agent.startAgent": {
  //   "name": "startAgent",
  //   "websocketSendType": "StartAgentEvent",
  //   "websocketSendSchema": "startAgentEventSchema",
  //   "websocketReceiveType": "TaskCompletionResponse",
  //   "websocketReceiveSchema": "taskCompletionResponseSchema"
  // },
  // "agent.getAgentsList": {
  //   "name": "getAgentsList",
  //   "websocketSendType": "ListAgentsEvent", 
  //   "websocketSendSchema": "listAgentsEventSchema",
  //   "websocketReceiveType": "ListAgentsResponse",
  //   "websocketReceiveSchema": "listAgentsResponseSchema"
  // },
  // "agent.getAgentsDetail": {
  //   "name": "getAgentsDetail",
  //   "websocketSendType": "GetAgentDetailsEvent",
  //   "websocketSendSchema": "getAgentDetailsEventSchema",
  //   "websocketReceiveType": "AgentsDetailResponse",
  //   "websocketReceiveSchema": "agentsDetailResponseSchema"
  // },

  // // Git APIs
  // "git.init": {
  //   "name": "init",
  //   "websocketSendType": "GitInitEvent", 
  //   "websocketSendSchema": "gitInitEventSchema",
  //   "websocketReceiveType": "GitInitResponse",
  //   "websocketReceiveSchema": "gitInitResponseSchema"
  // },
  // "git.pull": {
  //   "name": "pull",
  //   "websocketSendType": "GitPullEvent",
  //   "websocketSendSchema": "gitPullEventSchema",
  //   "websocketReceiveType": "GitPullResponse",
  //   "websocketReceiveSchema": "gitPullResponseSchema"
  // },
  // "git.push": {
  //   "name": "push",
  //   "websocketSendType": "GitPushEvent", 
  //   "websocketSendSchema": "gitPushEventSchema",
  //   "websocketReceiveType": "GitPushResponse",
  //   "websocketReceiveSchema": "gitPushResponseSchema"
  // },
  // "git.status": {
  //   "name": "status",
  //   "websocketSendType": "GitStatusEvent",
  //   "websocketSendSchema": "gitStatusEventSchema",
  //   "websocketReceiveType": "GitStatusResponse",
  //   "websocketReceiveSchema": "gitStatusResponseSchema"
  // },

  // "git.commit": {
  //   "name": "commit",
  //   "websocketSendType": "GitCommitEvent",
  //   "websocketSendSchema": "gitCommitEventSchema",
  //   "websocketReceiveType": "GitCommitResponse",
  //   "websocketReceiveSchema": "gitCommitResponseSchema"
  // },
  // "git.checkout": {
  //   "name": "checkout",
  //   "websocketSendType": "GitCheckoutEvent", 
  //   "websocketSendSchema": "gitCheckoutEventSchema",
  //   "websocketReceiveType": "GitCheckoutResponse",
  //   "websocketReceiveSchema": "gitCheckoutResponseSchema"
  // },
  // "git.branch": {
  //   "name": "branch",
  //   "websocketSendType": "GitBranchEvent",
  //   "websocketSendSchema": "gitBranchEventSchema",
  //   "websocketReceiveType": "GitBranchResponse",
  //   "websocketReceiveSchema": "gitBranchResponseSchema"
  // },
  // "git.logs": {
  //   "name": "logs",
  //   "websocketSendType": "GitLogsEvent", 
  //   "websocketSendSchema": "gitLogsEventSchema",
  //   "websocketReceiveType": "GitLogsResponse",
  //   "websocketReceiveSchema": "gitLogsResponseSchema"
  // },
  // "git.diff": {
  //   "name": "diff",
  //   "websocketSendType": "GitDiffEvent",
  //   "websocketSendSchema": "gitDiffEventSchema",
  //   "websocketReceiveType": "GitDiffResponse",
  //   "websocketReceiveSchema": "gitDiffResponseSchema"
  // },
  //"git.clone": {
  //  "name": "clone",
  //  "description": "Clones a git repository",
  //  "functionTypings": {} as any, // GitModule['clone'] - method exists but not in current SDK types
  //  "websocketSendType": null, // GitCloneEvent not available in current schema exports
  //  "websocketReceiveType": {} as { success: boolean },
  //  "websocketSendSchema": null, // gitCloneEventSchema not available in current schema exports
  //  "websocketReceiveSchema": z.object({ success: z.boolean() })
  //},

  // LLM APIs
  // "llm.inference": {
  //   "name": "inference",
  //   "websocketSendType": "InferenceEvent",
  //   "websocketSendSchema": "inferenceEventSchema",
  //   "websocketReceiveType": "LLMResponse",
  //   "websocketReceiveSchema": "llmResponseSchema"
  // },

  // Terminal API duplicates removed - using earlier definitions
  // "terminal.sendInterruptToTerminal": {
  //   "name": "sendInterruptToTerminal",
  //   "description": "Sends an interrupt signal to the terminal",
  //   "functionTypings": {} as any, // TerminalModule['sendInterruptToTerminal'] - method exists but not in current SDK types
  //   "websocketSendType": null, // SendInterruptToTerminalEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // sendInterruptToTerminalEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },

  // Task APIs (duplicates removed - using earlier definitions)
  // "taskplaner.getTasks": {
  //   "name": "getTasks",
  //   "websocketSendType": "GetTasksEvent", 
  //   "websocketSendSchema": "getTasksEventSchema",
  //   "websocketReceiveType": "GetTasksResponse",
  //   "websocketReceiveSchema": "getTasksResponseSchema"
  // },
  "taskplaner.getTasksByAgent": {
    "name": "getTasksByAgent",
    "description": "Retrieves tasks for a specific agent",
    "functionTypings": {} as TaskModule['getTasksByAgent'],
    "websocketSendType": {} as GetTasksByAgentEvent,
    "websocketReceiveType": {} as GetTasksByAgentResponse,
    "websocketSendSchema": getTasksByAgentEventSchema, 
    "websocketReceiveSchema": GetTasksByAgentResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  // "taskplaner.updateTask": {
  //   "name": "updateTask",
  //   "websocketSendType": "UpdateTaskEvent", 
  //   "websocketSendSchema": "updateTaskEventSchema",
  //   "websocketReceiveType": "UpdateTaskResponse",
  //   "websocketReceiveSchema": "updateTaskResponseSchema"
  // },
  // "taskplaner.deleteTask": {
  //   "name": "deleteTask",
  //   "websocketSendType": "DeleteTaskEvent",
  //   "websocketSendSchema": "deleteTaskEventSchema",
  //   "websocketReceiveType": "DeleteTaskResponse",
  //   "websocketReceiveSchema": "deleteTaskResponseSchema"
  // },
  // "taskplaner.addSubTask": {
  //   "name": "addSubTask",
  //   "websocketSendType": "AddSubTaskEvent", 
  //   "websocketSendSchema": "addSubTaskEventSchema",
  //   "websocketReceiveType": "AddSubTaskResponse",
  //   "websocketReceiveSchema": "addSubTaskResponseSchema"
  // },
  // "taskplaner.updateSubTask": {
  //   "name": "updateSubTask",
  //   "websocketSendType": "UpdateSubTaskEvent",
  //   "websocketSendSchema": "updateSubTaskEventSchema",
  //   "websocketReceiveType": "UpdateSubTaskResponse",
  //   "websocketReceiveSchema": "updateSubTaskResponseSchema"
  // },

  // Vector Database APIs (duplicates removed - using earlier definitions)

  // Memory APIs
  // "dbmemory.set": {
  //   "name": "set",
  //   "websocketSendType": "MemorySetEvent",
  //   "websocketSendSchema": "memorySetEventSchema",
  //   "websocketReceiveType": "MemorySetResponse",
  //   "websocketReceiveSchema": "memorySetResponseSchema"
  // },
  // "dbmemory.get": {
  //   "name": "get",
  //   "websocketSendType": "MemoryGetEvent", 
  //   "websocketSendSchema": "memoryGetEventSchema",
  //   "websocketReceiveType": "MemoryGetResponse",
  //   "websocketReceiveSchema": "memoryGetResponseSchema"
  // },
  // "dbmemory.delete": {
  //   "name": "delete",
  //   "description": "Deletes a memory entry",
  //   "functionTypings": {} as any, // MemoryModule['delete'] - method exists but not in current SDK types
  //   "websocketSendType": null, // MemoryDeleteEvent not available in current schema exports
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": null, // memoryDeleteEventSchema not available in current schema exports
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },

  // State APIs
  // "cbstate.getApplicationState": {
  //   "name": "getApplicationState",
  //   "websocketSendType": "GetApplicationStateEvent", 
  //   "websocketSendSchema": "getApplicationStateEventSchema",
  //   "websocketReceiveType": "GetApplicationStateResponse",
  //   "websocketReceiveSchema": "getApplicationStateResponseSchema"
  // },
  // "cbstate.addToAgentState": {
  //   "name": "addToAgentState",
  //   "websocketSendType": "AddToAgentStateEvent",
  //   "websocketSendSchema": "addToAgentStateEventSchema",
  //   "websocketReceiveType": "AddToAgentStateResponse",
  //   "websocketReceiveSchema": "addToAgentStateResponseSchema"
  // },
  // "cbstate.getAgentState": {
  //   "name": "getAgentState",
  //   "websocketSendType": "GetAgentStateEvent", 
  //   "websocketSendSchema": "getAgentStateEventSchema",
  //   "websocketReceiveType": "GetAgentStateResponse",
  //   "websocketReceiveSchema": "getAgentStateResponseSchema"
  // },
  // "cbstate.getProjectState": {
  //   "name": "getProjectState",
  //   "websocketSendType": "GetProjectStateEvent",
  //   "websocketSendSchema": "getProjectStateEventSchema",
  //   "websocketReceiveType": "GetProjectStateResponse",
  //   "websocketReceiveSchema": "getProjectStateResponseSchema"
  // },
  // "cbstate.updateProjectState": {
  //   "name": "updateProjectState",
  //   "websocketSendType": "UpdateProjectStateEvent", 
  //   "websocketSendSchema": "updateProjectStateEventSchema",
  //   "websocketReceiveType": "UpdateProjectStateResponse",
  //   "websocketReceiveSchema": "updateProjectStateResponseSchema"
  // },

  // Debug APIs
  // "debug.addLog": {
  //   "name": "addLog",
  //   "description": "Adds a debug log entry",
  //   "functionTypings": {} as DebugModule['log'],
  //   "websocketSendType": {} as AddLogEvent,
  //   "websocketReceiveType": {} as { success: boolean },
  //   "websocketSendSchema": addLogEventSchema,
  //   "websocketReceiveSchema": z.object({ success: z.boolean() })
  // },
  "debug.openDebugBrowser": {
    "name": "openDebugBrowser",
    "description": "Opens a debug browser instance",
    "functionTypings": {} as DebugModule['openDebugBrowser'],
    "websocketSendType": {} as OpenDebugBrowserEvent,
    "websocketReceiveType": {} as OpenDebugBrowserResponse,
    "websocketSendSchema": openDebugBrowserEventSchema,
    "websocketReceiveSchema": OpenDebugBrowserResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Tokenizer APIs
  "tokenizer.addToken": {
    "name": "addToken",
    "description": "Adds a token for tokenization",
    "functionTypings": {} as TokenizerModule['tokenize'],
    "websocketSendType": {} as AddTokenEvent,
    "websocketReceiveType": {} as AddTokenResponse,
    "websocketSendSchema": addTokenEventSchema,
    "websocketReceiveSchema": AddTokenResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "tokenizer.getToken": {
    "name": "getToken",
    "description": "Gets token information",
    "functionTypings": {} as TokenizerModule['countTokens'],
    "websocketSendType": {} as GetTokenEvent,
    "websocketReceiveType": {} as GetTokenResponse,
    "websocketSendSchema": getTokenEventSchema,
    "websocketReceiveSchema": GetTokenResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Project APIs
  "project.getProjectSettings": {
    "name": "getProjectSettings",
    "description": "Gets project settings and configuration",
    "functionTypings": {} as ProjectModule['getProjectSettings'],
    "websocketReceiveType": {} as GetProjectSettingsResponse,
    "websocketSendSchema": getProjectSettingsEventSchema, 
    "websocketReceiveSchema": GetProjectSettingsResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  // "project.getProjectPath": {
  //   "name": "getProjectPath",
  //   "websocketSendType": "GetProjectPathEvent", 
  //   "websocketSendSchema": "getProjectPathEventSchema",
  //   "websocketReceiveType": "GetProjectPathResponse",
  //   "websocketReceiveSchema": "getProjectPathResponseSchema"
  // },
  "project.getRepoMap": {
    "name": "getRepoMap",
    "description": "Gets a map of the repository structure",
    "functionTypings": {} as any, // ProjectModule['getRepoMap'] - method exists but not in current SDK types
    "websocketSendType": null, // GetRepoMapEvent not available in current schema exports
    "websocketReceiveType": {} as GetRepoMapResponse,
    "websocketSendSchema": null, // getRepoMapEventSchema not available in current schema exports
    "websocketReceiveSchema": GetRepoMapResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Crawler APIs
  // "crawler.startCrawler": {
  //   "name": "startCrawler",
  //   "description": "Starts a web crawler",
  //   "functionTypings": {} as CrawlerModule['crawl'],
  //   "websocketSendType": {} as StartCrawlerEvent,
  //   "websocketReceiveType": {} as CrawlerResponse,
  //   "websocketSendSchema": startCrawlerEventSchema,
  //   "websocketReceiveSchema": CrawlerResponseSchema,
  //   "notificationSchemas": [],
  //   "notificationTypes": []
  // },
  // "crawler.crawlerGoToPage": {
  //   "name": "crawlerGoToPage",
  //   "description": "Navigates crawler to a specific page",
  //   "functionTypings": {} as any, // CrawlerModule['crawlerGoToPage'] - method exists but not in current SDK types
  //   "websocketSendType": null, // CrawlerGoToPageEvent not available in current schema exports
  //   "websocketReceiveType": {} as CrawlerResponse,
  //   "websocketSendSchema": null, // crawlerGoToPageEventSchema not available in current schema exports
  //   "websocketReceiveSchema": CrawlerResponseSchema,
  //   "notificationSchemas": [],
  //   "notificationTypes": []
  // },

  // MCP APIs
  "mcp.getEnabledToolBoxes": {
    "name": "getEnabledToolBoxes",
    "description": "Gets enabled MCP toolboxes",
    "functionTypings": {} as MCPModule['listMcpFromServers'],
    "websocketSendType": {} as GetEnabledToolBoxesEvent,
    "websocketReceiveType": {} as GetEnabledToolBoxesResponse,
    "websocketSendSchema": getEnabledToolBoxesEventSchema,
    "websocketReceiveSchema": GetEnabledToolBoxesResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  // "mcp.getTools": {
  //   "name": "getTools",
  //   "websocketSendType": "GetToolsEvent",
  //   "websocketSendSchema": "getToolsEventSchema",
  //   "websocketReceiveType": "GetToolsResponse",
  //   "websocketReceiveSchema": "getToolsResponseSchema"
  // },
  // "mcp.executeTool": {
  //   "name": "executeTool",
  //   "websocketSendType": "ExecuteToolEvent", 
  //   "websocketSendSchema": "executeToolEventSchema",
  //   "websocketReceiveType": "ExecuteToolResponse",
  //   "websocketReceiveSchema": "executeToolResponseSchema"
  // },

  // Code Utils APIs
  "codeutils.getAllFilesAsMarkDown": {
    "name": "getAllFilesAsMarkDown",
    "description": "Gets all files as markdown",
    "functionTypings": {} as CodeUtilsModule['getAllFilesAsMarkDown'],
    "websocketSendType": {} as GetAllFilesMarkdownEvent,
    "websocketReceiveType": {} as GetAllFilesAsMarkdownResponse,
    "websocketSendSchema": GetAllFilesMarkdownEventSchema,
    "websocketReceiveSchema": GetAllFilesAsMarkdownResponseSchema,
    "notificationSchemas": [grepSearchRequestNotificationSchema, grepSearchResponseNotificationSchema],
    "notificationTypes": [{} as GrepSearchRequestNotification, {} as GrepSearchResponseNotification]
  },
  "codeutils.getMatcherList": {
    "name": "getMatcherList",
    "description": "Gets matcher list tree structure",
    "functionTypings": {} as CodeUtilsModule['getMatcherList'],
    "websocketSendType": {} as GetMatcherListEvent,
    "websocketReceiveType": {} as GetMatcherListTreeResponse,
    "websocketSendSchema": GetMatcherListEventSchema,
    "websocketReceiveSchema": GetMatcherListTreeResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "codeutils.matchDetail": {
    "name": "matchDetail",
    "description": "Gets details of a specific match",
    "functionTypings": {} as CodeUtilsModule['matchDetail'],
    "websocketSendType": {} as GetMatchDetailEvent,
    "websocketReceiveType": {} as GetMatchDetailResponse,
    "websocketSendSchema": GetMatchDetailEventSchema,
    "websocketReceiveSchema": GetMatchDetailResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "codeutils.performMatch": {
    "name": "performMatch",
    "description": "Performs a matching operation based on the provided matcher definition and problem patterns",
    "functionTypings": {} as CodeUtilsModule['performMatch'],
    "websocketSendType": {} as PerformMatchEvent,
    "websocketReceiveType": {} as MatchProblemResponse,
    "websocketSendSchema": PerformMatchEventSchema,
    "websocketReceiveSchema": MatchProblemResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },
  "codeutils.getJsTree": {
    "name": "getJsTree",
    "description": "Retrieves a JavaScript tree structure for a given file path",
    "functionTypings": {} as CodeUtilsModule['getJsTree'],
    "websocketSendType": null, // This function doesn't use WebSocket, it processes locally
    "websocketReceiveType": {} as GetJsTreeResponse,
    "websocketSendSchema": null, // This function doesn't use WebSocket, it processes locally
    "websocketReceiveSchema": GetJsTreeResponseSchema,
    "notificationSchemas": [],
    "notificationTypes": []
  },

  // Code Parsers APIs
  // "codeparsers.getJSTree": {
  //   "name": "getJSTree",
  //   "description": "Gets JavaScript AST tree",
  //   "functionTypings": {} as any, // CodeParsersModule['getJSTree'] - method exists but not in current SDK types
  //   "websocketSendType": null, // JSTreeParserEvent not available in current schema exports
  //   "websocketReceiveType": {} as GetJsTreeResponse,
  //   "websocketSendSchema": null, // jsTreeParserEventBaseSchema not available in current schema exports
  //   "websocketReceiveSchema": GetJsTreeResponseSchema,
  //   "notificationSchemas": [],
  //   "notificationTypes": []
  // },

  // Utils APIs
  // "utils.editFileAndApplyDiff": {
  //   "name": "editFileAndApplyDiff",
  //   "description": "Edits a file and applies diff changes",
  //   "functionTypings": {} as any, // Utils module method - exists but not in current SDK types
  //   "websocketSendType": null, // EditFileAndApplyDiffEvent for utils not same as fs version
  //   "websocketReceiveType": {} as EditFileAndApplyDiffResponse,
  //   "websocketSendSchema": null, // editFileAndApplyDiffEventSchema for utils not available
  //   "websocketReceiveSchema": EditFileAndApplyDiffResponseSchema,
  //   "notificationSchemas": [],
  //   "notificationTypes": []
  // },

  // Chat Summary APIs
  // "chatSummary.summarizeAll": {
  //   "name": "summarizeAll",
  //   "websocketSendType": "SummarizeAllEvent", 
  //   "websocketSendSchema": "summarizeAllEventSchema",
  //   "websocketReceiveType": "GetSummarizeAllResponse",
  //   "websocketReceiveSchema": "getSummarizeAllResponseSchema"
  // },
  // "chatSummary.summarize": {
  //   "name": "summarize",
  //   "websocketSendType": "SummarizeEvent",
  //   "websocketSendSchema": "summarizeEventSchema",
  //   "websocketReceiveType": "GetSummarizeResponse",
  //   "websocketReceiveSchema": "getSummarizeResponseSchema"
  // }
};
