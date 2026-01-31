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
    BrowserInstanceInfo,
    BrowserInstanceOptions,
    BrowserOperationOptions,

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
    // Application State Types
    ApplicationState,

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
    FileStateInfo,

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

    // Log Types
    LogType,

    // Message Types (for WebSocket communication)
    PendingRequest,
    MessageRoute,

    // User Message Types
    InitialUserMessage,

    // Configuration Types
    Config,

    // Error Types
    CodeboltError,

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
    JobGroupCreateResponse,
    // Pheromone types
    PheromoneType,
    PheromoneDeposit,
    PheromoneAggregation,
    AddPheromoneTypeData,
    DepositPheromoneData,
    JobPheromoneTypesResponse,
    JobPheromoneTypeResponse,
    JobPheromoneDepositResponse,
    JobPheromoneRemoveResponse,
    JobPheromoneListResponse,
    JobPheromoneAggregatedResponse,
    JobPheromoneSearchResponse,
    // Split proposal types
    ProposedJob,
    SplitProposal,
    AddSplitProposalData,
    JobSplitProposeResponse,
    JobSplitDeleteResponse,
    JobSplitAcceptResponse,
    // Lock types
    JobLock,
    JobLockStatus,
    JobLockAcquireResponse,
    JobLockReleaseResponse,
    JobLockCheckResponse,
    // Unlock request types
    UnlockRequest,
    AddUnlockRequestData,
    JobUnlockRequestAddResponse,
    JobUnlockRequestApproveResponse,
    JobUnlockRequestRejectResponse,
    JobUnlockRequestDeleteResponse,
    // Bidding types
    JobBid,
    AddBidData,
    JobBidAddResponse,
    JobBidWithdrawResponse,
    JobBidAcceptResponse,
    JobBidListResponse,
    // Blocker types
    JobBlocker,
    AddBlockerData,
    JobBlockerAddResponse,
    JobBlockerRemoveResponse,
    JobBlockerResolveResponse
} from '@codebolt/types/lib';


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
    IFeedbackRespondParams,
    IReplyParams,
    IUpdateSummaryParams,
    IUpdateStatusParams,
    ICreateFeedbackResponse,
    IGetFeedbackResponse,
    IListFeedbacksResponse,
    IFeedbackRespondResponse,
    IReplyResponse,
    IUpdateSummaryResponse,
    IUpdateStatusResponse
} from '@codebolt/types/lib';

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
} from '@codebolt/types/lib';

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
} from '@codebolt/types/lib';

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

// Export browser instance management functions
import cbbrowser from './modules/browser';
export const listBrowserInstances = cbbrowser.listBrowserInstances;
export const getBrowserInstance = cbbrowser.getBrowserInstance;
export const setActiveBrowserInstance = cbbrowser.setActiveBrowserInstance;
export const openNewBrowserInstance = cbbrowser.openNewBrowserInstance;
export const closeBrowserInstance = cbbrowser.closeBrowserInstance;
export const executeOnInstance = cbbrowser.executeOnInstance;

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

// Export sideExecution module and types
export { default as sideExecution } from './modules/sideExecution';
export type {
    StartSideExecutionResponse,
    StopSideExecutionResponse,
    ListActionBlocksResponse,
    GetSideExecutionStatusResponse,
    ActionBlock
} from './modules/sideExecution';

// Export capability module and types
export { default as capability } from './modules/capability';
export type {
    CapabilityType,
    CapabilityInput,
    CapabilityOutput,
    CapabilityMetadata,
    Capability,
    CapabilityFilter,
    CapabilityExecutor,
    CapabilityExecutionMetadata,
    ListCapabilitiesResponse,
    GetCapabilityDetailResponse,
    ListExecutorsResponse,
    StartCapabilityResponse,
    StopCapabilityResponse,
    GetExecutionStatusResponse
} from './modules/capability';

// Export actionBlock module and types
export { default as actionBlock } from './modules/actionBlock';
export type {
    ActionBlock as ActionBlockInfo,
    ActionBlockType,
    ActionBlockMetadata,
    ActionBlockFilter,
    ActionBlockInput,
    ActionBlockOutput,
    ListActionBlocksResponse as ActionBlockListResponse,
    GetActionBlockDetailResponse,
    StartActionBlockResponse,
} from './modules/actionBlock';

// Export requirementPlan module and types
export { default as requirementPlan } from './modules/requirementPlan';
export type {
    SectionType,
    RequirementPlanSection,
    RequirementPlanDocument,
    CreatePlanData,
    UpdatePlanData,
    AddSectionData,
    UpdateSectionData,
    RemoveSectionData,
    ReorderSectionsData,
    RequirementPlanCreateResponse,
    RequirementPlanGetResponse,
    RequirementPlanUpdateResponse,
    RequirementPlanListResponse,
    RequirementPlanSectionResponse
} from './modules/requirementPlan';

// Export swarm module and types
export { default as swarm } from './modules/swarm';
export type {
    CreateSwarmRequest,
    AgentRegistration,
    CreateTeamRequest,
    CreateRoleRequest,
    CreateVacancyRequest,
    AgentStatusUpdate,
    Swarm,
    SwarmAgent,
    Team,
    Role,
    Vacancy,
    StatusSummary,
    SwarmResponse,
    CreateSwarmResponse,
    ListSwarmsResponse,
    GetSwarmResponse,
    GetSwarmAgentsResponse,
    RegisterAgentResponse,
    UnregisterAgentResponse,
    CreateTeamResponse,
    ListTeamsResponse,
    GetTeamResponse,
    JoinTeamResponse,
    LeaveTeamResponse,
    DeleteTeamResponse,
    CreateRoleResponse,
    ListRolesResponse,
    GetRoleResponse,
    AssignRoleResponse,
    UnassignRoleResponse,
    GetAgentsByRoleResponse,
    DeleteRoleResponse,
    CreateVacancyResponse,
    ListVacanciesResponse,
    ApplyForVacancyResponse,
    CloseVacancyResponse,
    UpdateStatusResponse,
    GetStatusSummaryResponse
} from './modules/swarm';

// Export calendar module and types
export { default as calendar } from './modules/calendar';
export type {
    CalendarEventType,
    CalendarRSVPStatus,
    CalendarCheckType,
    CalendarParticipantType,
    CalendarParticipant,
    CalendarEvent,
    CalendarResponse,
    ICreateEventParams,
    IUpdateEventParams,
    IDeleteEventParams,
    IGetEventParams,
    IListEventsParams,
    IGetEventsInRangeParams,
    IGetUpcomingEventsParams,
    IGetTriggeredEventsParams,
    IMarkEventCompleteParams,
    IMarkEventsCompleteParams,
    IRSVPParams,
    ICreateEventResponse,
    IUpdateEventResponse,
    IDeleteEventResponse,
    IGetEventResponse,
    IListEventsResponse,
    IGetEventsInRangeResponse,
    IGetUpcomingEventsResponse,
    IGetTriggeredEventsResponse,
    IMarkEventCompleteResponse,
    IMarkEventsCompleteResponse,
    IGetTriggeredEventsAndMarkCompleteResponse,
    IRSVPResponse,
    IGetStatusResponse
} from './modules/calendar';

// Export episodicMemory module and types
export { default as episodicMemory } from './modules/episodicMemory';
export type {
    EpisodicEvent,
    EpisodicMemory,
    EpisodicEventFilter,
    EpisodicMemoryResponse,
    ICreateMemoryParams,
    IGetMemoryParams,
    IAppendEventParams,
    IQueryEventsParams,
    IGetEventTypesParams,
    IGetTagsParams,
    IGetAgentsParams,
    IArchiveMemoryParams,
    IUnarchiveMemoryParams,
    IUpdateTitleParams,
    ICreateMemoryResponse,
    IListMemoriesResponse,
    IGetMemoryResponse,
    IAppendEventResponse,
    IQueryEventsResponse,
    IGetEventTypesResponse,
    IGetTagsResponse,
    IGetAgentsResponse,
    IArchiveMemoryResponse,
    IUnarchiveMemoryResponse,
    IUpdateTitleResponse
} from './modules/episodicMemory';

// ================================
// Roadmap Types
// ================================
export type {
    RoadmapCreator,
    FeatureStatus,
    IdeaStatus,
    ImpactLevel,
    DifficultyLevel,
    Feature,
    Phase,
    Idea,
    RoadmapData,
    CreatePhaseData,
    UpdatePhaseData,
    CreateFeatureData,
    UpdateFeatureData,
    MoveFeatureData,
    CreateIdeaData,
    UpdateIdeaData,
    ReviewIdeaData,
    MoveIdeaToRoadmapData,
    RoadmapGetResponse,
    RoadmapPhasesResponse,
    RoadmapPhaseResponse,
    RoadmapDeleteResponse,
    RoadmapFeaturesResponse,
    RoadmapFeatureResponse,
    RoadmapIdeasResponse,
    RoadmapIdeaResponse,
    RoadmapMoveToRoadmapResponse
} from '@codebolt/types/lib';

// ================================
// Codemap Types
// ================================
export type {
    CodemapStatus,
    CodemapSection,
    Codemap,
    CodemapInfo,
    CreateCodemapData,
    UpdateCodemapData,
    CodemapListResponse,
    CodemapGetResponse,
    CodemapCreateResponse,
    CodemapSaveResponse,
    CodemapUpdateResponse,
    CodemapDeleteResponse
} from '@codebolt/types/lib';

// ================================
// Project Structure Types
// ================================
export type {
    HttpMethod,
    ApiRoute,
    DatabaseColumn,
    DatabaseTable,
    Dependency,
    RunCommand,
    UiRoute,
    DeploymentConfig,
    GitInfo,
    DesignGuidelines,
    FrameworkInfo,
    PackageMetadata,
    WorkspaceMetadata,
    CreatePackageData,
    UpdatePackageData,
    ProjectStructureMetadataResponse,
    ProjectStructurePackagesResponse,
    ProjectStructurePackageResponse,
    ProjectStructureDeleteResponse,
    ProjectStructureItemResponse,
    ProjectStructureUpdateResponse
} from '@codebolt/types/lib';

// ================================
// Codebase Search Types
// ================================
export type {
    CodeSearchResult,
    CodebaseSearchOptions,
    SearchMcpToolOptions,
    CodebaseSearchResponse,
    McpToolSearchResponse
} from '@codebolt/types/lib';

// ================================
// File Update Intent Types
// ================================
export type {
    IntentLevel,
    FileIntent,
    IntentStatus,
    FileUpdateIntent,
    CreateFileUpdateIntentRequest,
    UpdateFileUpdateIntentRequest,
    OverlappingIntentInfo,
    IntentOverlapResult,
    FileUpdateIntentFilters,
    FileUpdateIntentResponse,
    FileUpdateIntentListResponse,
    FileUpdateIntentOverlapResponse,
    FileUpdateIntentBlockedFilesResponse
} from '@codebolt/types/lib';

// Export fileUpdateIntent module
export { default as fileUpdateIntent } from './modules/fileUpdateIntent';

// Export projectStructureUpdateRequest module
export { default as projectStructureUpdateRequest } from './modules/projectStructureUpdateRequest';

// ================================
// Review Merge Request Types
// ================================
export type {
    ReviewRequestStatus,
    ReviewRequestType,
    MergeStrategy,
    WorktreeDetails,
    MergeConfig,
    MergeResult,
    ReviewFeedback,
    ReviewMergeRequest,
    CreateReviewMergeRequest,
    UpdateReviewMergeRequest,
    AddReviewFeedback,
    ReviewMergeRequestFilters,
    ReviewMergeRequestDisplaySettings
} from '@codebolt/types/lib';

// Export reviewMergeRequest module
export { default as reviewMergeRequest } from './modules/reviewMergeRequest';

// ================================
// KV Store Types
// ================================
export type {
    KVStoreBaseResponse,
    KVStoreInstance,
    KVRecord,
    KVQueryDSL,
    KVQueryCondition,
    KVQueryResult,
    CreateKVInstanceParams,
    UpdateKVInstanceParams,
    KVSetParams,
    KVGetParams,
    KVDeleteParams,
    KVDeleteNamespaceParams,
    KVInstanceResponse,
    KVInstanceListResponse,
    KVGetResponse,
    KVSetResponse,
    KVDeleteResponse,
    KVDeleteNamespaceResponse,
    KVQueryResponse,
    KVNamespacesResponse,
    KVRecordCountResponse
} from '@codebolt/types/lib';

// Export kvStore module
export { default as kvStore } from './modules/kvStore';

// ================================
// Persistent Memory Types
// ================================
export type {
    PersistentMemoryBaseResponse,
    PersistentMemory,
    RetrievalConfig,
    ContributionConfig,
    PipelineExecutionIntent,
    PipelineExecutionResult,
    CreatePersistentMemoryParams,
    UpdatePersistentMemoryParams,
    ListPersistentMemoryParams,
    PersistentMemoryResponse,
    PersistentMemoryListResponse,
    PersistentMemoryExecuteResponse,
    PersistentMemoryValidateResponse,
    PersistentMemoryStepSpecsResponse
} from '@codebolt/types/lib';

// Export persistentMemory module
export { default as persistentMemory } from './modules/persistentMemory';

// ================================
// Orchestrator Types
// ================================
export type {
    OrchestratorInstance,
    OrchestratorResponse,
    CreateOrchestratorParams,
    UpdateOrchestratorParams,
    UpdateOrchestratorSettingsParams
} from './modules/orchestrator';

// Export orchestrator module
export { default as orchestrator } from './modules/orchestrator';

// ================================
// Event Log Types
// ================================
export type {
    EventLogBaseResponse,
    EventLogInstance,
    EventLogEntry,
    EventLogDSL,
    EventLogCondition,
    EventLogQueryResult,
    CreateEventLogInstanceParams,
    UpdateEventLogInstanceParams,
    AppendEventParams,
    AppendEventsParams,
    EventLogInstanceResponse,
    EventLogInstanceListResponse,
    EventLogAppendResponse,
    EventLogAppendMultipleResponse,
    EventLogQueryResponse,
    EventLogStatsResponse
} from '@codebolt/types/lib';

// Export eventLog module
export { default as eventLog } from './modules/eventLog';

// ================================
// Knowledge Graph Types
// ================================
export type {
    KGBaseResponse,
    KGRecordKind,
    KGAttributeSchema,
    KGEdgeType,
    KGInstanceTemplate,
    KGInstance,
    KGMemoryRecord,
    KGEdge,
    KGViewTemplate,
    KGView,
    CreateKGInstanceTemplateParams,
    CreateKGInstanceParams,
    CreateKGMemoryRecordParams,
    CreateKGEdgeParams,
    CreateKGViewTemplateParams,
    CreateKGViewParams,
    ListKGMemoryRecordsParams,
    ListKGEdgesParams,
    KGInstanceTemplateResponse,
    KGInstanceTemplateListResponse,
    KGInstanceResponse,
    KGInstanceListResponse,
    KGMemoryRecordResponse,
    KGMemoryRecordListResponse,
    KGEdgeResponse,
    KGEdgeListResponse,
    KGViewTemplateResponse,
    KGViewTemplateListResponse,
    KGViewResponse,
    KGViewListResponse,
    KGViewExecuteResponse,
    KGDeleteResponse
} from '@codebolt/types/lib';

// Export knowledgeGraph module
export { default as knowledgeGraph } from './modules/knowledgeGraph';

// ================================
// Hook Types
// ================================
export type {
    HookBaseResponse,
    HookTrigger,
    HookAction,
    HookConfig,
    HookCondition,
    Hook,
    HookResponse,
    HookListResponse,
    HookInitializeResponse,
    HookDeleteResponse
} from '@codebolt/types/lib';

// Export hook module
export { default as hook } from './modules/hook';

// ================================
// Memory Ingestion Types
// ================================
export type {
    MemoryIngestionBaseResponse,
    IngestionTrigger,
    ProcessorType,
    RoutingDestination,
    IngestionProcessor,
    IngestionRouting,
    IngestionPipeline,
    IngestionEventData,
    IngestionExecutionResult,
    CreateIngestionPipelineParams,
    UpdateIngestionPipelineParams,
    ListIngestionPipelineParams,
    ExecuteIngestionParams,
    IngestionPipelineResponse,
    IngestionPipelineListResponse,
    IngestionExecuteResponse,
    IngestionValidateResponse,
    IngestionProcessorSpecsResponse
} from '@codebolt/types/lib';

// Export memoryIngestion module
export { default as memoryIngestion } from './modules/memoryIngestion';

// ================================
// Context Assembly Types
// ================================
export type {
    ContextAssemblyBaseResponse,
    ContextAssemblyRequest,
    ContextConstraints,
    MemoryContribution,
    AssembledContext,
    MemoryTypeSpec,
    ValidationResult,
    RuleEvaluationResult,
    RequiredVariablesResult,
    ContextAssemblyResponse,
    ContextValidateResponse,
    MemoryTypesResponse,
    RuleEvaluationResponse,
    RequiredVariablesResponse
} from '@codebolt/types/lib';

// Export contextAssembly module
export { default as contextAssembly } from './modules/contextAssembly';

// ================================
// Context Rule Engine Types
// ================================
export type {
    ContextRuleEngineBaseResponse,
    RuleOperator,
    RuleAction,
    RuleCondition,
    Rule,
    ContextRuleEngine,
    PossibleVariable,
    CreateContextRuleEngineParams,
    UpdateContextRuleEngineParams,
    EvaluateRulesParams,
    ContextRuleEngineResponse,
    ContextRuleEngineListResponse,
    ContextRuleEngineDeleteResponse,
    EvaluateRulesResponse,
    PossibleVariablesResponse
} from '@codebolt/types/lib';

// Export contextRuleEngine module
export { default as contextRuleEngine } from './modules/contextRuleEngine';

// ================================
// Agent Portfolio Types
// ================================
export type {
    AgentProfile,
    Talent,
    KarmaEntry,
    Testimonial,
    Appreciation,
    AgentPortfolio,
    AgentConversation,
    RankingEntry,
    GetPortfolioResponse,
    GetConversationsResponse,
    AddTestimonialResponse,
    UpdateTestimonialResponse,
    DeleteTestimonialResponse,
    AddKarmaResponse,
    GetKarmaHistoryResponse,
    AddAppreciationResponse,
    AddTalentResponse,
    EndorseTalentResponse,
    GetTalentsResponse,
    GetRankingResponse,
    GetPortfoliosByProjectResponse,
    UpdateProfileResponse
} from '@codebolt/types/lib';

// Export agentPortfolio module
export { default as agentPortfolio } from './modules/agentPortfolio';

// ================================
// Agent Event Queue Types
// ================================
export type {
    AgentEventMessage,
    AddEventInput,
    SendAgentMessageInput,
    AckEventInput,
    GetPendingEventsInput,
    AgentEventQueueResponse,
    AddEventResponseData,
    GetPendingEventsResponseData,
    QueueStatsResponseData,
    QueueEventHandler,
    AgentMessagePayload,
    CalendarUpdatePayload,
    SystemNotificationPayload,
    TaskUpdatePayload,
    CustomEventPayload,
    AgentEventPayload,
    PullEventsInput,
    PullEventsResponseData
} from '@codebolt/types/lib';

export {
    AgentEventType,
    AgentEventStatus,
    AgentEventPriority
} from '@codebolt/types/lib';

// Export agentEventQueue module
export { default as agentEventQueue } from './modules/agentEventQueue';

// ================================
// Core Modules - Direct exports for documentation
// ================================

// File System module
export { default as fs } from './modules/fs';

// Git module
export { default as git } from './modules/git';

// LLM module
export { default as llm } from './modules/llm';

// Mail module
export { default as mail } from './modules/mail';

// Group Feedback module
export { default as groupFeedback } from './modules/groupFeedback';

// Agent Deliberation module
export { default as agentDeliberation } from './modules/agentDeliberation';

// Browser module
export { default as browser } from './modules/browser';

// Chat module
export { default as chat } from './modules/chat';

// Terminal module
export { default as terminal } from './modules/terminal';

// Codeutils module
export { default as codeutils } from './modules/codeutils';

// Crawler module
export { default as crawler } from './modules/crawler';

// Search module
export { default as search } from './modules/search';

// Knowledge module
export { default as knowledge } from './modules/knowledge';

// RAG module
export { default as rag } from './modules/rag';

// Output Parsers module
export { default as outputparsers } from './modules/outputparsers';

// Project module
export { default as project } from './modules/project';

// DB Memory module
export { default as dbmemory } from './modules/dbmemory';

// State module
export { default as state } from './modules/state';

// Task module
export { default as task } from './modules/task';

// Thread module
export { default as thread } from './modules/thread';

// VectorDB module
export { default as vectordb } from './modules/vectordb';

// Debug module
export { default as debug } from './modules/debug';

// Tokenizer module
export { default as tokenizer } from './modules/tokenizer';

// History module (chatSummary)
export { chatSummary } from './modules/history';

// MCP module
export { default as mcp } from './modules/mcp';

// Agent module
export { default as agent } from './modules/agent';

// Memory module
export { default as memory } from './modules/memory';

// Action Plan module
export { default as actionPlan } from './modules/actionPlan';

// Todo module
export { default as todo } from './modules/todo';

// Job module
export { default as job } from './modules/job';

// AutoTesting module
export { default as autoTesting } from './modules/autoTesting';

// Roadmap module
export { default as roadmap } from './modules/roadmap';

// Codemap module
export { default as codemap } from './modules/codemap';

// Project Structure module
export { default as projectStructure } from './modules/projectStructure';

// Codebase Search module
export { default as codebaseSearch } from './modules/codebaseSearch';

// Background Child Threads module
export { default as backgroundChildThreads } from './modules/backgroundChildThreads';

// ================================
// Tools Module - LLM-ready tool definitions
// ================================

// Export tools module and types
export { default as tools } from './tools';
export {
    // Types (renamed to avoid conflict with libFunctionTypes.ToolResult)
    Kind,
    ToolErrorType,
    ToolConfirmationOutcome,
    type ToolResult as ToolFrameworkResult,
    type ToolLocation,
    type ToolInvocation,
    type ToolBuilder,
    type OpenAIToolSchema,
    type OpenAIFunctionCall,
    type ToolCallConfirmationDetails,
    type AnyDeclarativeTool,
    type AnyToolInvocation,
    // Base classes
    BaseToolInvocation,
    DeclarativeTool,
    BaseDeclarativeTool,
    // Registry
    ToolRegistry,
    defaultRegistry,
    // All tools
    allTools,
    // Tool categories
    fileTools,
    searchTools,
    terminalTools,
    gitTools,
    browserTools,
    agentTools,
    threadTools,
    taskTools,
    orchestratorTools,
    // Individual tools
    ReadFileTool,
    WriteFileTool,
    EditTool,
    ListDirectoryTool,
    ReadManyFilesTool,
    GlobTool,
    GrepTool,
    SearchFilesTool,
    CodebaseSearchTool,
    SearchMcpToolTool,
    ListCodeDefinitionNamesTool,
    ExecuteCommandTool,
    // Git tools (individual)
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
    // Browser tools (individual)
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
    // Task tools (individual)
    TaskCreateTool,
    TaskUpdateTool,
    TaskDeleteTool,
    TaskListTool,
    TaskGetTool,
    TaskAssignTool,
    TaskExecuteTool,
    // Agent tools (individual)
    AgentFindTool,
    AgentStartTool,
    AgentListTool,
    AgentDetailsTool,
    // Thread tools (individual)
    ThreadCreateTool,
    ThreadCreateStartTool,
    ThreadCreateBackgroundTool,
    ThreadListTool,
    ThreadGetTool,
    ThreadStartTool,
    ThreadUpdateTool,
    ThreadDeleteTool,
    ThreadGetMessagesTool,
    ThreadUpdateStatusTool,
    // Orchestrator tools (individual)
    OrchestratorListTool,
    OrchestratorGetTool,
    OrchestratorGetSettingsTool,
    OrchestratorCreateTool,
    OrchestratorUpdateTool,
    OrchestratorUpdateSettingsTool,
    OrchestratorDeleteTool,
    OrchestratorUpdateStatusTool,
} from './tools';
