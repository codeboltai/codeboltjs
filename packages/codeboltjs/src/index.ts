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
} from './types/job';

// ================================
// Group Feedback Types
// ================================
export type {
    GroupFeedbackAction,
    GroupFeedbackResponseType,
    FeedbackContentType,
    FeedbackStatus,
    FeedbackAttachment,
    GroupFeedback,
    FeedbackResponse,
    ICreateFeedbackParams,
    IGetFeedbackParams,
    IListFeedbacksParams,
    IRespondParams,
    IReplyParams,
    IUpdateSummaryParams,
    IUpdateStatusParams,
    ICreateFeedbackResponse,
    IGetFeedbackResponse,
    IListFeedbacksResponse,
    IRespondResponse,
    IReplyResponse,
    IUpdateSummaryResponse,
    IUpdateStatusResponse
} from './types/groupFeedback';

// ================================
// Agent Deliberation Types
// ================================
export type {
    AgentDeliberationAction,
    AgentDeliberationResponseType,
    DeliberationStatus,
    Deliberation,
    DeliberationResponse,
    DeliberationVote,
    ICreateDeliberationParams,
    IGetDeliberationParams,
    IListDeliberationsParams,
    IUpdateDeliberationParams,
    IRespondParams as IDeliberationRespondParams,
    IVoteParams,
    IGetWinnerParams,
    ICreateDeliberationResponse,
    IGetDeliberationResponse,
    IListDeliberationsResponse,
    IUpdateDeliberationResponse,
    IRespondResponse as IDeliberationRespondResponse,
    IVoteResponse,
    IGetWinnerResponse
} from './types/agentDeliberation';

// ================================
// AutoTesting Types
// ================================
export type {
    AutoTestingAction,
    AutoTestingResponseType,
    TestStatus,
    TestRunStatus,
    TestStep,
    TestCase,
    TestSuite,
    TestRunStep,
    TestRunCase,
    TestRun,
    ICreateSuiteParams,
    IGetSuiteParams,
    IListSuitesParams,
    IUpdateSuiteParams,
    IDeleteSuiteParams,
    IAddCaseToSuiteParams,
    IRemoveCaseFromSuiteParams,
    ICreateCaseParams,
    IGetCaseParams,
    IListCasesParams,
    IUpdateCaseParams,
    IDeleteCaseParams,
    ICreateRunParams,
    IGetRunParams,
    IListRunsParams,
    IUpdateRunStatusParams,
    IUpdateRunCaseParams,
    IUpdateRunStepParams,
    ICreateSuiteResponse,
    IGetSuiteResponse,
    IListSuitesResponse,
    IUpdateSuiteResponse,
    IDeleteSuiteResponse,
    IAddCaseToSuiteResponse,
    IRemoveCaseFromSuiteResponse,
    ICreateCaseResponse,
    IGetCaseResponse,
    IListCasesResponse,
    IUpdateCaseResponse,
    IDeleteCaseResponse,
    ICreateRunResponse,
    IGetRunResponse,
    IListRunsResponse,
    IUpdateRunStatusResponse,
    IUpdateRunCaseResponse,
    IUpdateRunStepResponse
} from './types/autoTesting';

// ================================
// Main Library Instance (process-wide singleton)
// ================================

const globalKey = '__codebolt_singleton__';
const g = globalThis as any;

if (!g[globalKey]) {
    g[globalKey] = new Codebolt();
}

const codebolt = g[globalKey] as Codebolt;

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

// ================================
// Export specific utilities and enums
// ================================

// Export logType enum from debug module
export { logType } from './modules/debug';

// Export user message utilities
export { userMessageUtilities } from './modules/user-message-utilities';

// Export specific functions for backward compatibility
import { userMessageUtilities } from './modules/user-message-utilities';
export const getCurrentUserMessage = () => userMessageUtilities.getCurrent();
export const getUserMessageText = () => userMessageUtilities.getText();
export const hasCurrentUserMessage = () => userMessageUtilities.hasMessage();
export const clearUserMessage = () => userMessageUtilities.clear();
export const getMentionedFiles = () => userMessageUtilities.getMentionedFiles();
export const getMentionedMCPs = () => userMessageUtilities.getMentionedMCPs();
export const getCurrentFile = () => userMessageUtilities.getCurrentFile();
export const getSelection = () => userMessageUtilities.getSelection();
export const getRemixPrompt = () => userMessageUtilities.getRemixPrompt();
export const getUploadedImages = () => userMessageUtilities.getUploadedImages();
export const setUserSessionData = (key: string, value: any) => userMessageUtilities.setSessionData(key, value);
export const getUserSessionData = (key: string) => userMessageUtilities.getSessionData(key);
export const getUserMessageTimestamp = () => userMessageUtilities.getTimestamp();
export const getMessageId = () => userMessageUtilities.getMessageId();

// Export utilities functions
export { default as utils } from './modules/utils';

// Export vectordb functions
import VectorDB from './modules/vectordb';
export const getVector = (key: string) => VectorDB.getVector(key);
export const addVectorItem = (item: any) => VectorDB.addVectorItem(item);
export const queryVectorItem = (key: string) => VectorDB.queryVectorItem(key);
export const queryVectorItems = (items: any[], dbPath: string) => VectorDB.queryVectorItems(items as [], dbPath);

// Export utils functions
import cbutils from './modules/utils';
export const editFileAndApplyDiff = (filePath: string, diff: string, diffIdentifier: string, prompt: string, applyModel?: string) => cbutils.editFileAndApplyDiff(filePath, diff, diffIdentifier, prompt, applyModel);

// Export notification functions
export {
    agentNotifications,
    browserNotifications,
    chatNotifications,
    codeutilsNotifications,
    crawlerNotifications,
    dbmemoryNotifications,
    fsNotifications,
    gitNotifications,
    historyNotifications,
    llmNotifications,
    mcpNotifications,
    searchNotifications,
    systemNotifications,
    terminalNotifications,
    todoNotifications,
    notificationFunctions,
    type NotificationFunctions
} from './notificationfunctions';

// Export specific agent notification functions that are commonly imported
export {
    StartSubagentTaskRequestNotify,
    StartSubagentTaskResponseNotify,
    SubagentTaskCompletedNotify
} from './notificationfunctions/agent';

// Export specific system and terminal notification functions that are commonly imported
export {
    AgentInitNotify,
    AgentCompletionNotify
} from './notificationfunctions/system';

export {
    CommandExecutionRequestNotify
} from './notificationfunctions/terminal';

export {
    GitAddRequestNotify,
    GitBranchRequestNotify,
    GitCheckoutRequestNotify,
    GitCloneRequestNotify,
    GitCommitRequestNotify,
    GitDiffRequestNotify,
    GitInitRequestNotify,
    GitLogsRequestNotify,
    GitPullRequestNotify,
    GitPushRequestNotify,
    GitRemoteAddRequestNotify,
    GitStatusRequestNotify
} from './notificationfunctions/git';
