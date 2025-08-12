/**
 * Agent-to-App WebSocket Schemas
 * Zod schemas for agent-to-app communication
 */

// Re-export individual schemas from each module
// This approach allows selective importing of only schemas, not types

// Agent Event Schemas
export {
  agentLocationSchema,
  agentsSchema,
  filterUsingSchema,
  agentEventBaseSchema,
  findAgentEventSchema,
  startAgentEventSchema,
  listAgentsEventSchema,
  getAgentsDetailEventSchema,
  agentEventSchema,
} from './wstypes/agent-to-app-ws/actions/agentEventSchemas';

// Code Utils Event Schemas
export {
  GetAllFilesMarkdownEventSchema,
  PerformMatchEventSchema,
  GetMatcherListEventSchema,
  GetMatchDetailEventSchema,
  codeUtilsEventSchema,
} from './wstypes/agent-to-app-ws/actions/codeUtilsEventSchemas';

// Notification Schemas
export {
  agentNotificationBaseSchema,
  startSubagentTaskRequestNotificationSchema,
  startSubagentTaskResponseNotificationSchema,
  subagentTaskCompletedNotificationSchema,
  agentNotificationSchema
} from './wstypes/agent-to-app-ws/notification/agentNotificationSchemas';

export {
  AgentMessageBaseSchema
} from './wstypes/agent-to-app-ws/notification/baseSchemas';

export {
  browserNotificationBaseSchema,
  webFetchRequestNotificationSchema,
  webFetchResponseNotificationSchema,
  webSearchRequestNotificationSchema,
  webSearchResponseNotificationSchema,
  browserNotificationSchema
} from './wstypes/agent-to-app-ws/notification/browserNotificationSchemas';

export {
  chatNotificationBaseSchema,
  userMessageRequestNotificationSchema,
  agentTextResponseNotificationSchema,
  getChatHistoryRequestNotificationSchema,
  getChatHistoryResultNotificationSchema,
  chatNotificationSchema
} from './wstypes/agent-to-app-ws/notification/chatNotificationSchemas';

export {
  codeUtilsNotificationBaseSchema,
  grepSearchRequestNotificationSchema,
  grepSearchResponseNotificationSchema,
  globSearchRequestNotificationSchema,
  globSearchResponseNotificationSchema,
  codeUtilsNotificationSchema
} from './wstypes/agent-to-app-ws/notification/codeUtilsNotificationSchemas';

export {
  crawlerNotificationBaseSchema,
  crawlerSearchRequestNotificationSchema,
  crawlerSearchResponseNotificationSchema,
  crawlerStartRequestNotificationSchema,
  crawlerStartResponseNotificationSchema,
  crawlerNotificationSchema
} from './wstypes/agent-to-app-ws/notification/crawlerNotificationSchemas';

export {
  dbMemoryNotificationBaseSchema,
  addMemoryRequestNotificationSchema,
  addMemoryResultNotificationSchema,
  getMemoryRequestNotificationSchema,
  getMemoryResultNotificationSchema,
  dbMemoryNotificationSchema
} from './wstypes/agent-to-app-ws/notification/dbMemoryNotificationSchemas';

export {
  fsNotificationBaseSchema,
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
  appendToFileRequestNotificationSchema,
  appendToFileResponseNotificationSchema,
  copyFileRequestNotificationSchema,
  copyFileResponseNotificationSchema,
  moveFileRequestNotificationSchema,
  moveFileResponseNotificationSchema,
  fsNotificationSchema
} from './wstypes/agent-to-app-ws/notification/fsNotificationSchemas';

export {
  gitNotificationBaseSchema,
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
  gitRemoteAddRequestNotificationSchema,
  gitRemoteAddResponseNotificationSchema,
  gitRemoteRemoveRequestNotificationSchema,
  gitRemoteRemoveResponseNotificationSchema,
  gitCloneRequestNotificationSchema,
  gitCloneResponseNotificationSchema,
  gitNotificationSchema
} from './wstypes/agent-to-app-ws/notification/gitNotificationSchemas';

export {
  historyNotificationBaseSchema,
  summarizePreviousConversationRequestNotificationSchema,
  summarizePreviousConversationResultNotificationSchema,
  summarizeCurrentMessageRequestNotificationSchema,
  summarizeCurrentMessageResultNotificationSchema,
  historyNotificationSchema
} from './wstypes/agent-to-app-ws/notification/historyNotificationSchemas';

export {
  llmNotificationBaseSchema,
  llmRequestNotificationSchema,
  llmResponseNotificationSchema,
  llmGetTokenCountRequestNotificationSchema,
  llmGetTokenCountResponseNotificationSchema,
  llmNotificationSchema
} from './wstypes/agent-to-app-ws/notification/llmNotificationSchemas';

export {
  mcpNotificationBaseSchema,
  getEnabledMCPServersRequestNotificationSchema,
  getEnabledMCPServersResultNotificationSchema,
  listToolsFromMCPServersRequestNotificationSchema,
  listToolsFromMCPServersResultNotificationSchema,
  getToolsRequestNotificationSchema,
  getToolsResultNotificationSchema,
  executeToolRequestNotificationSchema,
  executeToolResultNotificationSchema,
  mcpNotificationSchema
} from './wstypes/agent-to-app-ws/notification/mcpNotificationSchemas';

export {
  searchNotificationBaseSchema,
  searchInitRequestSchema,
  searchRequestSchema,
  getFirstLinkRequestSchema,
  codebaseSearchRequestSchema,
  searchInitResultSchema,
  searchResultSchema,
  getFirstLinkResultSchema,
  codebaseSearchResultSchema,
  searchNotificationSchema
} from './wstypes/agent-to-app-ws/notification/searchNotificationSchemas';

export {
  systemNotificationBaseSchema,
  agentInitNotificationSchema,
  agentCompletionNotificationSchema,
  systemNotificationSchema
} from './wstypes/agent-to-app-ws/notification/systemNotificationSchemas';

export {
  terminalNotificationBaseSchema,
  commandExecutionRequestNotificationSchema,
  commandExecutionResponseNotificationSchema,
  terminalNotificationSchema
} from './wstypes/agent-to-app-ws/notification/terminalNotificationSchemas';

export {
  todoNotificationBaseSchema,
  addTodoRequestNotificationSchema,
  addTodoResponseNotificationSchema,
  getTodoRequestNotificationSchema,
  getTodoTasksResponseNotificationSchema,
  editTodoTaskRequestNotificationSchema,
  editTodoTaskResponseNotificationSchema,
  todoNotificationSchema
} from './wstypes/agent-to-app-ws/notification/todoNotificationSchemas';

// Action Event Schemas
export {
  browserEventBaseSchema,
  newPageEventSchema,
  getUrlEventSchema,
  goToPageEventSchema,
  screenshotEventSchema,
  getHtmlEventSchema,
  getMarkdownEventSchema,
  getPdfEventSchema,
  pdfToTextEventSchema,
  getContentEventSchema,
  getSnapShotEventSchema,
  getBrowserInfoEventSchema,
  extractTextEventSchema,
  closeEventSchema,
  scrollEventSchema,
  typeEventSchema,
  clickEventSchema,
  enterEventSchema,
  searchEventSchema,
  browserEventSchema
} from './wstypes/agent-to-app-ws/actions/browserEventSchemas';

export {
  chatEventBaseSchema,
  getChatHistoryEventSchema,
  processStoppedEventSchema,
  processStartedEventSchema,
  processFinishedEventSchema,
  sendMessageEventSchema,
  waitforReplyEventSchema,
  confirmationRequestEventSchema,
  notificationEventSchema,
  chatEventSchema
} from './wstypes/agent-to-app-ws/actions/chatEventSchemas';

export {
  crawlerEventBaseSchema,
  startCrawlerEventSchema,
  crawlerScreenshotEventSchema,
  crawlerGoToPageEventSchema,
  crawlerScrollEventSchema,
  crawlerClickEventSchema,
  crawlerEventSchema
} from './wstypes/agent-to-app-ws/actions/crawlerEventSchemas';

export {
  logTypeSchema as debugLogTypeSchema,
  debugEventBaseSchema,
  addLogEventSchema,
  openDebugBrowserEventSchema,
  debugEventSchema
} from './wstypes/agent-to-app-ws/actions/debugEventSchemas';

export {
  fsEventBaseSchema,
  createFileEventSchema,
  createFolderEventSchema,
  readFileEventSchema,
  updateFileEventSchema,
  deleteFileEventSchema,
  deleteFolderEventSchema,
  fileListEventSchema,
  listCodeDefinitionNamesEventSchema,
  searchFilesEventSchema,
  writeToFileEventSchema,
  grepSearchEventSchema,
  fileSearchEventSchema,
  editFileWithDiffEventSchema,
  fsEventSchema
} from './wstypes/agent-to-app-ws/actions/fsEventSchemas';

export {
  gitEventBaseSchema,
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
  gitEventSchema
} from './wstypes/agent-to-app-ws/actions/gitEventSchemas';

export {
  logTypeSchema as historyLogTypeSchema,
  chatSummaryEventBaseSchema,
  summarizeAllEventSchema,
  summarizeEventSchema,
  historyEventSchema
} from './wstypes/agent-to-app-ws/actions/historyEventSchemas';

export {
  llmEventBaseSchema,
  inferenceEventSchema,
  legacyInferenceEventSchema,
  llmEventSchema
} from './wstypes/agent-to-app-ws/actions/llmEventSchemas';

export {
  mcpEventBaseSchema,
  getEnabledToolBoxesEventSchema,
  getLocalToolBoxesEventSchema,
  getAvailableToolBoxesEventSchema,
  searchAvailableToolBoxesEventSchema,
  listToolsFromToolBoxesEventSchema,
  configureToolBoxEventSchema,
  getToolsEventSchema,
  executeToolEventSchema,
  mcpEventSchema
} from './wstypes/agent-to-app-ws/actions/mcpEventSchemas';

export {
  memoryEventBaseSchema,
  memorySetEventSchema,
  memoryGetEventSchema,
  memoryEventSchema
} from './wstypes/agent-to-app-ws/actions/memoryEventSchemas';

export {
  projectEventBaseSchema,
  getProjectSettingsEventSchema,
  getProjectPathEventSchema,
  getRepoMapEventSchema,
  getEditorFileStatusEventSchema,
  runProjectEventSchema,
  projectEventSchema
} from './wstypes/agent-to-app-ws/actions/projectEventSchemas';

export {
  stateEventBaseSchema,
  getApplicationStateEventSchema,
  addToAgentStateEventSchema,
  getAgentStateEventSchema,
  getProjectStateEventSchema,
  updateProjectStateEventSchema,
  stateEventSchema
} from './wstypes/agent-to-app-ws/actions/stateEventSchemas';

export {
  taskEventBaseSchema,
  addTaskEventSchema,
  addSimpleTaskEventSchema,
  getTasksEventSchema,
  getTasksByAgentEventSchema,
  getTasksByCategoryEventSchema,
  getAllAgentsEventSchema,
  updateTaskEventSchema,
  deleteTaskEventSchema,
  addSubTaskEventSchema,
  updateSubTaskEventSchema,
  deleteSubTaskEventSchema,
  createTasksFromMarkdownEventSchema,
  exportTasksToMarkdownEventSchema,
  taskEventSchema
} from './wstypes/agent-to-app-ws/actions/taskEventSchemas';

export {
  terminalEventBaseSchema,
  executeCommandEventSchema,
  executeCommandRunUntilErrorEventSchema,
  executeCommandWithStreamEventSchema,
  sendInterruptToTerminalEventSchema,
  terminalEventSchema
} from './wstypes/agent-to-app-ws/actions/terminalEventSchemas';

export {
  tokenizerEventBaseSchema,
  addTokenEventSchema,
  getTokenEventSchema,
  tokenizerEventSchema
} from './wstypes/agent-to-app-ws/actions/tokenizerEventSchemas';

export {
  utilsEventBaseSchema,
  editFileAndApplyDiffEventSchema,
  utilsEventSchema
} from './wstypes/agent-to-app-ws/actions/utilsEventSchemas';

export {
  vectordbEventBaseSchema,
  getVectorEventSchema,
  addVectorItemEventSchema,
  queryVectorItemEventSchema,
  queryVectorItemsEventSchema,
  vectordbEventSchema
} from './wstypes/agent-to-app-ws/actions/vectordbEventSchemas'; 