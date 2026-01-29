[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / tools

# Variable: tools

> `const` **tools**: `object`

Defined in: [packages/codeboltjs/src/tools/index.ts:578](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/index.ts#L578)

Tools module providing LLM-ready tool definitions

## Type Declaration

### actionBlock

> **actionBlock**: (`ListActionBlocksTool` \| `GetActionBlockDetailTool` \| `StartActionBlockTool`)[] = `actionBlockTools`

### admin

> **admin**: (`OrchestratorListTool` \| `OrchestratorGetTool` \| `OrchestratorCreateTool` \| `OrchestratorUpdateTool` \| `CodemapListTool` \| `CodemapGetTool` \| `CodemapCreateTool` \| `CodemapUpdateTool` \| `HookCreateTool` \| `HookListTool` \| `HookGetTool` \| `HookEnableTool` \| `HookDisableTool` \| `EventLogCreateInstanceTool` \| `EventLogGetInstanceTool` \| `EventLogListInstancesTool` \| `EventLogAppendEventTool` \| `EventLogQueryEventsTool` \| `EventLogGetStatsTool`)[] = `adminTools`

### agent

> **agent**: ([`AgentFindTool`](../classes/AgentFindTool.md) \| [`AgentStartTool`](../classes/AgentStartTool.md) \| [`AgentListTool`](../classes/AgentListTool.md) \| [`AgentDetailsTool`](../classes/AgentDetailsTool.md))[] = `agentTools`

### agentDeliberation

> **agentDeliberation**: (`DeliberationCreateTool` \| `DeliberationGetTool` \| `DeliberationListTool` \| `DeliberationUpdateTool` \| `DeliberationRespondTool` \| `DeliberationVoteTool` \| `DeliberationGetWinnerTool` \| `DeliberationSummaryTool`)[] = `agentDeliberationTools`

### agentEventQueue

> **agentEventQueue**: (`EventQueueAddEventTool` \| `EventQueueSendMessageTool` \| `EventQueueGetStatsTool` \| `EventQueueGetPendingTool` \| `EventQueueWaitNextTool` \| `EventQueueAcknowledgeTool`)[] = `agentEventQueueTools`

### agentPortfolio

> **agentPortfolio**: (`PortfolioGetTool` \| `PortfolioGetConversationsTool` \| `PortfolioAddTestimonialTool` \| `PortfolioUpdateTestimonialTool` \| `PortfolioDeleteTestimonialTool` \| `PortfolioAddKarmaTool` \| `PortfolioGetKarmaHistoryTool` \| `PortfolioAddAppreciationTool` \| `PortfolioAddTalentTool` \| `PortfolioEndorseTalentTool` \| `PortfolioGetTalentsTool` \| `PortfolioGetRankingTool` \| `PortfolioGetByProjectTool` \| `PortfolioUpdateProfileTool`)[] = `agentPortfolioTools`

### autoTesting

> **autoTesting**: (`AutoTestingCreateSuiteTool` \| `AutoTestingGetSuiteTool` \| `AutoTestingListSuitesTool` \| `AutoTestingUpdateSuiteTool` \| `AutoTestingDeleteSuiteTool` \| `AutoTestingAddCaseToSuiteTool` \| `AutoTestingRemoveCaseFromSuiteTool` \| `AutoTestingCreateCaseTool` \| `AutoTestingGetCaseTool` \| `AutoTestingListCasesTool` \| `AutoTestingUpdateCaseTool` \| `AutoTestingDeleteCaseTool` \| `AutoTestingCreateRunTool` \| `AutoTestingGetRunTool` \| `AutoTestingListRunsTool` \| `AutoTestingUpdateRunStatusTool` \| `AutoTestingUpdateRunCaseTool` \| `AutoTestingUpdateRunStepTool`)[] = `autoTestingTools`

### backgroundChildThreads

> **backgroundChildThreads**: (`AddRunningAgentTool` \| `GetRunningAgentCountTool` \| `CheckBackgroundAgentCompletionTool` \| `OnBackgroundAgentCompletionTool`)[] = `backgroundChildThreadsTools`

### browser

> **browser**: ([`BrowserNavigateTool`](../classes/BrowserNavigateTool.md) \| [`BrowserScreenshotTool`](../classes/BrowserScreenshotTool.md) \| [`BrowserClickTool`](../classes/BrowserClickTool.md) \| [`BrowserTypeTool`](../classes/BrowserTypeTool.md) \| [`BrowserScrollTool`](../classes/BrowserScrollTool.md) \| [`BrowserGetContentTool`](../classes/BrowserGetContentTool.md) \| [`BrowserGetHtmlTool`](../classes/BrowserGetHtmlTool.md) \| [`BrowserGetMarkdownTool`](../classes/BrowserGetMarkdownTool.md) \| [`BrowserGetUrlTool`](../classes/BrowserGetUrlTool.md) \| [`BrowserCloseTool`](../classes/BrowserCloseTool.md) \| [`BrowserEnterTool`](../classes/BrowserEnterTool.md) \| [`BrowserSearchTool`](../classes/BrowserSearchTool.md))[] = `browserTools`

### calendar

> **calendar**: (`CalendarCreateEventTool` \| `CalendarUpdateEventTool` \| `CalendarDeleteEventTool` \| `CalendarGetEventTool` \| `CalendarListEventsTool` \| `CalendarGetUpcomingTool` \| `CalendarMarkCompleteTool` \| `CalendarGetStatusTool`)[] = `calendarTools`

### capability

> **capability**: (`CapabilityListTool` \| `CapabilityListSkillsTool` \| `CapabilityListPowersTool` \| `CapabilityGetDetailTool` \| `CapabilityStartTool` \| `CapabilityStartSkillTool` \| `CapabilityStopTool` \| `CapabilityGetStatusTool`)[] = `capabilityTools`

### chat

> **chat**: (`ChatGetHistoryTool` \| `ChatSendTool` \| `ChatWaitReplyTool` \| `ChatConfirmTool` \| `ChatAskTool` \| `ChatNotifyTool` \| `ChatStopProcessTool`)[] = `chatTools`

### codebaseSearch

> **codebaseSearch**: (`CodebaseSearchTool` \| `CodebaseSearchMcpToolTool`)[] = `codebaseSearchTools`

### codemap

> **codemap**: (`CodemapListTool` \| `CodemapGetTool` \| `CodemapCreateTool` \| `CodemapSaveTool` \| `CodemapSetStatusTool` \| `CodemapUpdateTool` \| `CodemapDeleteTool`)[] = `codemapTools`

### codeutils

> **codeutils**: (`CodeUtilsGetFilesMarkdownTool` \| `CodeUtilsPerformMatchTool` \| `CodeUtilsGetMatcherListTool` \| `CodeUtilsMatchDetailTool`)[] = `codeutilsTools`

### collaboration

> **collaboration**: (`FeedbackCreateTool` \| `FeedbackGetTool` \| `FeedbackListTool` \| `FeedbackRespondTool` \| `DeliberationCreateTool` \| `DeliberationGetTool` \| `DeliberationListTool` \| `DeliberationRespondTool` \| `DeliberationVoteTool` \| `PortfolioGetTool` \| `PortfolioAddTestimonialTool` \| `PortfolioAddKarmaTool` \| `PortfolioAddTalentTool` \| `PortfolioEndorseTalentTool` \| `PortfolioGetRankingTool`)[] = `collaborationTools`

### context

> **context**: (`ContextRuleCreateTool` \| `ContextRuleListTool` \| `ContextRuleEvaluateTool` \| `ContextRuleGetTool` \| `ContextRuleDeleteTool`)[] = `contextTools`

### contextAssembly

> **contextAssembly**: (`ContextGetTool` \| `ContextValidateTool` \| `ContextListMemoryTypesTool` \| `ContextEvaluateRulesTool` \| `ContextGetRequiredVariablesTool`)[] = `contextAssemblyTools`

### contextRuleEngine

> **contextRuleEngine**: (`RuleCreateTool` \| `RuleGetTool` \| `RuleListTool` \| `RuleUpdateTool` \| `RuleDeleteTool` \| `RuleEvaluateTool` \| `RuleGetPossibleVariablesTool`)[] = `contextRuleEngineTools`

### dbmemory

> **dbmemory**: (`DBMemoryAddKnowledgeTool` \| `DBMemoryGetKnowledgeTool`)[] = `dbmemoryTools`

### debug

> **debug**: (`DebugAddLogTool` \| `DebugOpenBrowserTool`)[] = `debugTools`

### episodicMemory

> **episodicMemory**: (`EpisodicCreateMemoryTool` \| `EpisodicListMemoriesTool` \| `EpisodicGetMemoryTool` \| `EpisodicAppendEventTool` \| `EpisodicQueryEventsTool` \| `EpisodicGetEventTypesTool` \| `EpisodicGetTagsTool` \| `EpisodicGetAgentsTool` \| `EpisodicArchiveMemoryTool` \| `EpisodicUnarchiveMemoryTool` \| `EpisodicUpdateTitleTool`)[] = `episodicMemoryTools`

### eventLog

> **eventLog**: (`EventLogCreateInstanceTool` \| `EventLogGetInstanceTool` \| `EventLogListInstancesTool` \| `EventLogUpdateInstanceTool` \| `EventLogDeleteInstanceTool` \| `EventLogAppendEventTool` \| `EventLogAppendEventsTool` \| `EventLogQueryEventsTool` \| `EventLogGetInstanceStatsTool`)[] = `eventLogTools`

### executeTool()

> **executeTool**: (`name`, `params`, `signal?`, `updateOutput?`) => `Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Execute a tool by name

#### Parameters

##### name

`string`

##### params

`object`

##### signal?

`AbortSignal`

##### updateOutput?

(`output`) => `void`

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

### file

> **file**: ([`ReadFileTool`](../classes/ReadFileTool.md) \| [`WriteFileTool`](../classes/WriteFileTool.md) \| [`EditTool`](../classes/EditTool.md) \| [`ListDirectoryTool`](../classes/ListDirectoryTool.md) \| [`ReadManyFilesTool`](../classes/ReadManyFilesTool.md))[] = `fileTools`

### fs

> **fs**: (`FsCreateFileTool` \| `FsCreateFolderTool` \| `FsReadFileTool` \| `FsUpdateFileTool` \| `FsDeleteFileTool` \| `FsDeleteFolderTool` \| `FsListFileTool` \| `FsGrepSearchTool` \| `FsFileSearchTool` \| `FsSearchFilesTool` \| `FsReadManyFilesTool` \| `FsListDirectoryTool` \| `FsListCodeDefinitionsTool`)[] = `fsTools`

### getAllTools()

> **getAllTools**: () => (`UtilsEditFileAndApplyDiffTool` \| [`ReadFileTool`](../classes/ReadFileTool.md) \| [`WriteFileTool`](../classes/WriteFileTool.md) \| [`EditTool`](../classes/EditTool.md) \| [`ListDirectoryTool`](../classes/ListDirectoryTool.md) \| [`ReadManyFilesTool`](../classes/ReadManyFilesTool.md) \| `ListActionBlocksTool` \| `GetActionBlockDetailTool` \| `StartActionBlockTool` \| `GetAllActionPlansTool` \| `CreateActionPlanTool` \| `AddTaskToActionPlanTool` \| `CreateKVInstanceTool` \| `KVSetTool` \| `KVGetTool` \| `GetRoadmapTool` \| `CreateRoadmapPhaseTool` \| `CreateRoadmapIdeaTool` \| `CreateReviewMergeRequestTool` \| `ListReviewMergeRequestsTool` \| `MergeReviewMergeRequestTool` \| `CreateMemoryIngestionPipelineTool` \| `ExecuteMemoryIngestionPipelineTool` \| `RAGAddFileTool` \| `RAGRetrieveKnowledgeTool` \| `WebSearchTool` \| `GetFirstLinkTool` \| `DBMemoryAddKnowledgeTool` \| `DBMemoryGetKnowledgeTool` \| `EventQueueAddEventTool` \| `EventQueueSendMessageTool` \| `EventQueueGetStatsTool` \| `EventQueueGetPendingTool` \| `EventQueueWaitNextTool` \| `EventQueueAcknowledgeTool` \| [`GlobTool`](../classes/GlobTool.md) \| [`GrepTool`](../classes/GrepTool.md) \| [`SearchFilesTool`](../classes/SearchFilesTool.md) \| [`CodebaseSearchTool`](../classes/CodebaseSearchTool.md) \| [`SearchMcpToolTool`](../classes/SearchMcpToolTool.md) \| [`ListCodeDefinitionNamesTool`](../classes/ListCodeDefinitionNamesTool.md) \| [`ExecuteCommandTool`](../classes/ExecuteCommandTool.md) \| [`GitInitTool`](../classes/GitInitTool.md) \| [`GitStatusTool`](../classes/GitStatusTool.md) \| [`GitAddTool`](../classes/GitAddTool.md) \| [`GitCommitTool`](../classes/GitCommitTool.md) \| [`GitPushTool`](../classes/GitPushTool.md) \| [`GitPullTool`](../classes/GitPullTool.md) \| [`GitCheckoutTool`](../classes/GitCheckoutTool.md) \| [`GitBranchTool`](../classes/GitBranchTool.md) \| [`GitLogsTool`](../classes/GitLogsTool.md) \| [`GitDiffTool`](../classes/GitDiffTool.md) \| [`GitCloneTool`](../classes/GitCloneTool.md) \| [`BrowserNavigateTool`](../classes/BrowserNavigateTool.md) \| [`BrowserScreenshotTool`](../classes/BrowserScreenshotTool.md) \| [`BrowserClickTool`](../classes/BrowserClickTool.md) \| [`BrowserTypeTool`](../classes/BrowserTypeTool.md) \| [`BrowserScrollTool`](../classes/BrowserScrollTool.md) \| [`BrowserGetContentTool`](../classes/BrowserGetContentTool.md) \| [`BrowserGetHtmlTool`](../classes/BrowserGetHtmlTool.md) \| [`BrowserGetMarkdownTool`](../classes/BrowserGetMarkdownTool.md) \| [`BrowserGetUrlTool`](../classes/BrowserGetUrlTool.md) \| [`BrowserCloseTool`](../classes/BrowserCloseTool.md) \| [`BrowserEnterTool`](../classes/BrowserEnterTool.md) \| [`BrowserSearchTool`](../classes/BrowserSearchTool.md) \| [`AgentFindTool`](../classes/AgentFindTool.md) \| [`AgentStartTool`](../classes/AgentStartTool.md) \| [`AgentListTool`](../classes/AgentListTool.md) \| [`AgentDetailsTool`](../classes/AgentDetailsTool.md) \| [`ThreadCreateTool`](../classes/ThreadCreateTool.md) \| [`ThreadCreateStartTool`](../classes/ThreadCreateStartTool.md) \| [`ThreadCreateBackgroundTool`](../classes/ThreadCreateBackgroundTool.md) \| [`ThreadListTool`](../classes/ThreadListTool.md) \| [`ThreadGetTool`](../classes/ThreadGetTool.md) \| [`ThreadStartTool`](../classes/ThreadStartTool.md) \| [`ThreadUpdateTool`](../classes/ThreadUpdateTool.md) \| [`ThreadDeleteTool`](../classes/ThreadDeleteTool.md) \| [`ThreadGetMessagesTool`](../classes/ThreadGetMessagesTool.md) \| [`ThreadUpdateStatusTool`](../classes/ThreadUpdateStatusTool.md) \| [`TaskCreateTool`](../classes/TaskCreateTool.md) \| [`TaskUpdateTool`](../classes/TaskUpdateTool.md) \| [`TaskDeleteTool`](../classes/TaskDeleteTool.md) \| [`TaskListTool`](../classes/TaskListTool.md) \| [`TaskGetTool`](../classes/TaskGetTool.md) \| [`TaskAssignTool`](../classes/TaskAssignTool.md) \| [`TaskExecuteTool`](../classes/TaskExecuteTool.md) \| [`OrchestratorListTool`](../classes/OrchestratorListTool.md) \| [`OrchestratorGetTool`](../classes/OrchestratorGetTool.md) \| [`OrchestratorGetSettingsTool`](../classes/OrchestratorGetSettingsTool.md) \| [`OrchestratorCreateTool`](../classes/OrchestratorCreateTool.md) \| [`OrchestratorUpdateTool`](../classes/OrchestratorUpdateTool.md) \| [`OrchestratorUpdateSettingsTool`](../classes/OrchestratorUpdateSettingsTool.md) \| [`OrchestratorDeleteTool`](../classes/OrchestratorDeleteTool.md) \| [`OrchestratorUpdateStatusTool`](../classes/OrchestratorUpdateStatusTool.md) \| `StateGetAppTool` \| `StateAddAgentTool` \| `StateGetAgentTool` \| `StateGetProjectTool` \| `StateUpdateProjectTool` \| `ProjectGetSettingsTool` \| `ProjectGetPathTool` \| `ProjectGetRepoMapTool` \| `ProjectRunTool` \| `ProjectGetEditorStatusTool` \| `LLMInferenceTool` \| `LLMGetConfigTool` \| `MemoryJsonSaveTool` \| `MemoryJsonUpdateTool` \| `MemoryJsonDeleteTool` \| `MemoryJsonListTool` \| `MemoryTodoSaveTool` \| `MemoryTodoUpdateTool` \| `MemoryTodoDeleteTool` \| `MemoryTodoListTool` \| `MemoryMarkdownSaveTool` \| `MemoryMarkdownUpdateTool` \| `MemoryMarkdownDeleteTool` \| `MemoryMarkdownListTool` \| `EpisodicMemoryCreateTool` \| `EpisodicMemoryListTool` \| `EpisodicMemoryGetTool` \| `EpisodicMemoryAppendEventTool` \| `EpisodicMemoryQueryEventsTool` \| `EpisodicMemoryGetEventTypesTool` \| `EpisodicMemoryArchiveTool` \| `EpisodicMemoryUpdateTitleTool` \| `PersistentMemoryCreateTool` \| `PersistentMemoryGetTool` \| `PersistentMemoryListTool` \| `PersistentMemoryUpdateTool` \| `PersistentMemoryRetrieveTool` \| `TodoAddTool` \| `TodoUpdateTool` \| `TodoListTool` \| `TodoListIncompleteTool` \| `TodoExportTool` \| `TodoImportTool` \| `ChatGetHistoryTool` \| `ChatSendTool` \| `ChatWaitReplyTool` \| `ChatConfirmTool` \| `ChatAskTool` \| `ChatNotifyTool` \| `ChatStopProcessTool` \| `CapabilityListTool` \| `CapabilityListSkillsTool` \| `CapabilityListPowersTool` \| `CapabilityGetDetailTool` \| `CapabilityStartTool` \| `CapabilityStartSkillTool` \| `CapabilityStopTool` \| `CapabilityGetStatusTool` \| `MCPListServersTool` \| `MCPGetToolsTool` \| `MCPExecuteToolTool` \| `MCPConfigureServerTool` \| `KGTemplateCreateTool` \| `KGTemplateListTool` \| `KGTemplateGetTool` \| `KGTemplateDeleteTool` \| `KGInstanceCreateTool` \| `KGInstanceListTool` \| `KGInstanceGetTool` \| `KGInstanceDeleteTool` \| `KGRecordAddTool` \| `KGRecordListTool` \| `KGEdgeAddTool` \| `KGEdgeListTool` \| `PlanGetAllTool` \| `PlanGetDetailTool` \| `PlanCreateTool` \| `PlanUpdateTool` \| `PlanAddTaskTool` \| `PlanStartTaskTool` \| `RoadmapGetTool` \| `RoadmapGetPhasesTool` \| `RoadmapCreatePhaseTool` \| `RoadmapUpdatePhaseTool` \| `RoadmapDeletePhaseTool` \| `RoadmapGetFeaturesTool` \| `RoadmapCreateFeatureTool` \| `RoadmapUpdateFeatureTool` \| `RoadmapGetIdeasTool` \| `RoadmapCreateIdeaTool` \| `JobCreateTool` \| `JobGetTool` \| `JobUpdateTool` \| `JobDeleteTool` \| `JobListTool` \| `JobGroupCreateTool` \| `JobAddDependencyTool` \| `JobGetReadyTool` \| `JobGetBlockedTool` \| `JobLockTool` \| `JobUnlockTool` \| `JobBidAddTool` \| `CalendarCreateEventTool` \| `CalendarUpdateEventTool` \| `CalendarDeleteEventTool` \| `CalendarGetEventTool` \| `CalendarListEventsTool` \| `CalendarGetUpcomingTool` \| `CalendarMarkCompleteTool` \| `CalendarGetStatusTool` \| `TestSuiteCreateTool` \| `TestSuiteGetTool` \| `TestSuiteListTool` \| `TestSuiteUpdateTool` \| `TestSuiteDeleteTool` \| `TestCaseCreateTool` \| `TestCaseGetTool` \| `TestCaseListTool` \| `TestCaseUpdateTool` \| `TestRunCreateTool` \| `TestRunGetTool` \| `TestRunUpdateStatusTool` \| `FeedbackCreateTool` \| `FeedbackGetTool` \| `FeedbackListTool` \| `FeedbackRespondTool` \| `DeliberationCreateTool` \| `DeliberationGetTool` \| `DeliberationListTool` \| `DeliberationRespondTool` \| `DeliberationVoteTool` \| `PortfolioGetTool` \| `PortfolioAddTestimonialTool` \| `PortfolioAddKarmaTool` \| `PortfolioAddTalentTool` \| `PortfolioEndorseTalentTool` \| `PortfolioGetRankingTool` \| `ReviewCreateTool` \| `ReviewGetTool` \| `ReviewListTool` \| `ReviewUpdateTool` \| `ReviewSubmitTool` \| `ReviewApproveTool` \| `ReviewRequestChangesTool` \| `ReviewAddCommentTool` \| `OrchestratorListTool` \| `OrchestratorGetTool` \| `OrchestratorCreateTool` \| `OrchestratorUpdateTool` \| `CodemapListTool` \| `CodemapGetTool` \| `CodemapCreateTool` \| `CodemapUpdateTool` \| `HookCreateTool` \| `HookListTool` \| `HookGetTool` \| `HookEnableTool` \| `HookDisableTool` \| `EventLogCreateInstanceTool` \| `EventLogGetInstanceTool` \| `EventLogListInstancesTool` \| `EventLogAppendEventTool` \| `EventLogQueryEventsTool` \| `EventLogGetStatsTool` \| `ContextRuleCreateTool` \| `ContextRuleListTool` \| `ContextRuleEvaluateTool` \| `ContextRuleGetTool` \| `ContextRuleDeleteTool` \| `TokenizerAddTool` \| `TokenizerGetTool` \| `VectorGetTool` \| `VectorAddItemTool` \| `VectorQueryTool` \| `VectorQueryItemsTool` \| `DebugAddLogTool` \| `DebugOpenBrowserTool` \| `CodeUtilsGetFilesMarkdownTool` \| `CodeUtilsPerformMatchTool` \| `CodeUtilsGetMatcherListTool` \| `CodeUtilsMatchDetailTool` \| `HistorySummarizeAllTool` \| `HistorySummarizeTool` \| `DeliberationCreateTool` \| `DeliberationGetTool` \| `DeliberationListTool` \| `DeliberationUpdateTool` \| `DeliberationRespondTool` \| `DeliberationVoteTool` \| `DeliberationGetWinnerTool` \| `DeliberationSummaryTool` \| `PortfolioGetTool` \| `PortfolioGetConversationsTool` \| `PortfolioAddTestimonialTool` \| `PortfolioUpdateTestimonialTool` \| `PortfolioDeleteTestimonialTool` \| `PortfolioAddKarmaTool` \| `PortfolioGetKarmaHistoryTool` \| `PortfolioAddAppreciationTool` \| `PortfolioAddTalentTool` \| `PortfolioEndorseTalentTool` \| `PortfolioGetTalentsTool` \| `PortfolioGetRankingTool` \| `PortfolioGetByProjectTool` \| `PortfolioUpdateProfileTool` \| `CodebaseSearchTool` \| `CodebaseSearchMcpToolTool` \| `CodemapListTool` \| `CodemapGetTool` \| `CodemapCreateTool` \| `CodemapSaveTool` \| `CodemapSetStatusTool` \| `CodemapUpdateTool` \| `CodemapDeleteTool` \| `AddRunningAgentTool` \| `GetRunningAgentCountTool` \| `CheckBackgroundAgentCompletionTool` \| `OnBackgroundAgentCompletionTool` \| `ContextGetTool` \| `ContextValidateTool` \| `ContextListMemoryTypesTool` \| `ContextEvaluateRulesTool` \| `ContextGetRequiredVariablesTool` \| `RuleCreateTool` \| `RuleGetTool` \| `RuleListTool` \| `RuleUpdateTool` \| `RuleDeleteTool` \| `RuleEvaluateTool` \| `RuleGetPossibleVariablesTool` \| `FeedbackCreateTool` \| `FeedbackGetTool` \| `FeedbackListTool` \| `FeedbackRespondTool` \| `FeedbackReplyTool` \| `FeedbackUpdateSummaryTool` \| `FeedbackUpdateStatusTool` \| `AutoTestingCreateSuiteTool` \| `AutoTestingGetSuiteTool` \| `AutoTestingListSuitesTool` \| `AutoTestingUpdateSuiteTool` \| `AutoTestingDeleteSuiteTool` \| `AutoTestingAddCaseToSuiteTool` \| `AutoTestingRemoveCaseFromSuiteTool` \| `AutoTestingCreateCaseTool` \| `AutoTestingGetCaseTool` \| `AutoTestingListCasesTool` \| `AutoTestingUpdateCaseTool` \| `AutoTestingDeleteCaseTool` \| `AutoTestingCreateRunTool` \| `AutoTestingGetRunTool` \| `AutoTestingListRunsTool` \| `AutoTestingUpdateRunStatusTool` \| `AutoTestingUpdateRunCaseTool` \| `AutoTestingUpdateRunStepTool` \| `EpisodicCreateMemoryTool` \| `EpisodicListMemoriesTool` \| `EpisodicGetMemoryTool` \| `EpisodicAppendEventTool` \| `EpisodicQueryEventsTool` \| `EpisodicGetEventTypesTool` \| `EpisodicGetTagsTool` \| `EpisodicGetAgentsTool` \| `EpisodicArchiveMemoryTool` \| `EpisodicUnarchiveMemoryTool` \| `EpisodicUpdateTitleTool` \| `EventLogCreateInstanceTool` \| `EventLogGetInstanceTool` \| `EventLogListInstancesTool` \| `EventLogUpdateInstanceTool` \| `EventLogDeleteInstanceTool` \| `EventLogAppendEventTool` \| `EventLogAppendEventsTool` \| `EventLogQueryEventsTool` \| `EventLogGetInstanceStatsTool` \| `FsCreateFileTool` \| `FsCreateFolderTool` \| `FsReadFileTool` \| `FsUpdateFileTool` \| `FsDeleteFileTool` \| `FsDeleteFolderTool` \| `FsListFileTool` \| `FsGrepSearchTool` \| `FsFileSearchTool` \| `FsSearchFilesTool` \| `FsReadManyFilesTool` \| `FsListDirectoryTool` \| `FsListCodeDefinitionsTool` \| `HookInitializeTool` \| `HookCreateTool` \| `HookUpdateTool` \| `HookDeleteTool` \| `HookListTool` \| `HookGetTool` \| `HookEnableTool` \| `HookDisableTool` \| `KGCreateInstanceTemplateTool` \| `KGGetInstanceTemplateTool` \| `KGListInstanceTemplatesTool` \| `KGUpdateInstanceTemplateTool` \| `KGDeleteInstanceTemplateTool` \| `KGCreateInstanceTool` \| `KGGetInstanceTool` \| `KGListInstancesTool` \| `KGDeleteInstanceTool` \| `KGAddMemoryRecordTool` \| `KGAddMemoryRecordsTool` \| `KGGetMemoryRecordTool` \| `KGListMemoryRecordsTool` \| `KGUpdateMemoryRecordTool` \| `KGDeleteMemoryRecordTool` \| `KGAddEdgeTool` \| `KGAddEdgesTool` \| `KGListEdgesTool` \| `KGDeleteEdgeTool` \| `KGCreateViewTemplateTool` \| `KGGetViewTemplateTool` \| `KGListViewTemplatesTool` \| `KGUpdateViewTemplateTool` \| `KGDeleteViewTemplateTool` \| `KGCreateViewTool` \| `KGListViewsTool` \| `KGExecuteViewTool` \| `KGDeleteViewTool` \| `OutputParsersParseJSONTool` \| `OutputParsersParseXMLTool` \| `OutputParsersParseCSVTool` \| `OutputParsersParseTextTool` \| `OutputParsersParseErrorsTool` \| `OutputParsersParseWarningsTool` \| `PersistentMemoryCreateTool` \| `PersistentMemoryGetTool` \| `PersistentMemoryListTool` \| `PersistentMemoryUpdateTool` \| `PersistentMemoryDeleteTool` \| `PersistentMemoryExecuteRetrievalTool` \| `PersistentMemoryValidateTool` \| `PersistentMemoryGetStepSpecsTool` \| `UpdateRequestCreateTool` \| `UpdateRequestGetTool` \| `UpdateRequestListTool` \| `UpdateRequestUpdateTool` \| `UpdateRequestDeleteTool` \| `UpdateRequestSubmitTool` \| `UpdateRequestStartWorkTool` \| `UpdateRequestCompleteTool` \| `UpdateRequestMergeTool` \| `UpdateRequestAddDisputeTool` \| `UpdateRequestResolveDisputeTool` \| `UpdateRequestAddCommentTool` \| `UpdateRequestWatchTool` \| `UpdateRequestUnwatchTool` \| `RequirementPlanCreateTool` \| `RequirementPlanGetTool` \| `RequirementPlanUpdateTool` \| `RequirementPlanListTool` \| `RequirementPlanAddSectionTool` \| `RequirementPlanUpdateSectionTool` \| `RequirementPlanRemoveSectionTool` \| `RequirementPlanReorderSectionsTool` \| `RequirementPlanReviewTool` \| `UserMessageGetCurrentTool` \| `UserMessageGetTextTool` \| `UserMessageGetConfigTool` \| `UserMessageGetMentionedFilesTool` \| `UserUtilitiesGetCurrentTool` \| `UserUtilitiesGetTextTool` \| `UserUtilitiesGetMentionedMCPsTool` \| `UserUtilitiesGetMentionedFilesTool` \| `UserUtilitiesGetCurrentFileTool` \| `UserUtilitiesGetSelectionTool`)[]

Get all available tools

#### Returns

(`UtilsEditFileAndApplyDiffTool` \| [`ReadFileTool`](../classes/ReadFileTool.md) \| [`WriteFileTool`](../classes/WriteFileTool.md) \| [`EditTool`](../classes/EditTool.md) \| [`ListDirectoryTool`](../classes/ListDirectoryTool.md) \| [`ReadManyFilesTool`](../classes/ReadManyFilesTool.md) \| `ListActionBlocksTool` \| `GetActionBlockDetailTool` \| `StartActionBlockTool` \| `GetAllActionPlansTool` \| `CreateActionPlanTool` \| `AddTaskToActionPlanTool` \| `CreateKVInstanceTool` \| `KVSetTool` \| `KVGetTool` \| `GetRoadmapTool` \| `CreateRoadmapPhaseTool` \| `CreateRoadmapIdeaTool` \| `CreateReviewMergeRequestTool` \| `ListReviewMergeRequestsTool` \| `MergeReviewMergeRequestTool` \| `CreateMemoryIngestionPipelineTool` \| `ExecuteMemoryIngestionPipelineTool` \| `RAGAddFileTool` \| `RAGRetrieveKnowledgeTool` \| `WebSearchTool` \| `GetFirstLinkTool` \| `DBMemoryAddKnowledgeTool` \| `DBMemoryGetKnowledgeTool` \| `EventQueueAddEventTool` \| `EventQueueSendMessageTool` \| `EventQueueGetStatsTool` \| `EventQueueGetPendingTool` \| `EventQueueWaitNextTool` \| `EventQueueAcknowledgeTool` \| [`GlobTool`](../classes/GlobTool.md) \| [`GrepTool`](../classes/GrepTool.md) \| [`SearchFilesTool`](../classes/SearchFilesTool.md) \| [`CodebaseSearchTool`](../classes/CodebaseSearchTool.md) \| [`SearchMcpToolTool`](../classes/SearchMcpToolTool.md) \| [`ListCodeDefinitionNamesTool`](../classes/ListCodeDefinitionNamesTool.md) \| [`ExecuteCommandTool`](../classes/ExecuteCommandTool.md) \| [`GitInitTool`](../classes/GitInitTool.md) \| [`GitStatusTool`](../classes/GitStatusTool.md) \| [`GitAddTool`](../classes/GitAddTool.md) \| [`GitCommitTool`](../classes/GitCommitTool.md) \| [`GitPushTool`](../classes/GitPushTool.md) \| [`GitPullTool`](../classes/GitPullTool.md) \| [`GitCheckoutTool`](../classes/GitCheckoutTool.md) \| [`GitBranchTool`](../classes/GitBranchTool.md) \| [`GitLogsTool`](../classes/GitLogsTool.md) \| [`GitDiffTool`](../classes/GitDiffTool.md) \| [`GitCloneTool`](../classes/GitCloneTool.md) \| [`BrowserNavigateTool`](../classes/BrowserNavigateTool.md) \| [`BrowserScreenshotTool`](../classes/BrowserScreenshotTool.md) \| [`BrowserClickTool`](../classes/BrowserClickTool.md) \| [`BrowserTypeTool`](../classes/BrowserTypeTool.md) \| [`BrowserScrollTool`](../classes/BrowserScrollTool.md) \| [`BrowserGetContentTool`](../classes/BrowserGetContentTool.md) \| [`BrowserGetHtmlTool`](../classes/BrowserGetHtmlTool.md) \| [`BrowserGetMarkdownTool`](../classes/BrowserGetMarkdownTool.md) \| [`BrowserGetUrlTool`](../classes/BrowserGetUrlTool.md) \| [`BrowserCloseTool`](../classes/BrowserCloseTool.md) \| [`BrowserEnterTool`](../classes/BrowserEnterTool.md) \| [`BrowserSearchTool`](../classes/BrowserSearchTool.md) \| [`AgentFindTool`](../classes/AgentFindTool.md) \| [`AgentStartTool`](../classes/AgentStartTool.md) \| [`AgentListTool`](../classes/AgentListTool.md) \| [`AgentDetailsTool`](../classes/AgentDetailsTool.md) \| [`ThreadCreateTool`](../classes/ThreadCreateTool.md) \| [`ThreadCreateStartTool`](../classes/ThreadCreateStartTool.md) \| [`ThreadCreateBackgroundTool`](../classes/ThreadCreateBackgroundTool.md) \| [`ThreadListTool`](../classes/ThreadListTool.md) \| [`ThreadGetTool`](../classes/ThreadGetTool.md) \| [`ThreadStartTool`](../classes/ThreadStartTool.md) \| [`ThreadUpdateTool`](../classes/ThreadUpdateTool.md) \| [`ThreadDeleteTool`](../classes/ThreadDeleteTool.md) \| [`ThreadGetMessagesTool`](../classes/ThreadGetMessagesTool.md) \| [`ThreadUpdateStatusTool`](../classes/ThreadUpdateStatusTool.md) \| [`TaskCreateTool`](../classes/TaskCreateTool.md) \| [`TaskUpdateTool`](../classes/TaskUpdateTool.md) \| [`TaskDeleteTool`](../classes/TaskDeleteTool.md) \| [`TaskListTool`](../classes/TaskListTool.md) \| [`TaskGetTool`](../classes/TaskGetTool.md) \| [`TaskAssignTool`](../classes/TaskAssignTool.md) \| [`TaskExecuteTool`](../classes/TaskExecuteTool.md) \| [`OrchestratorListTool`](../classes/OrchestratorListTool.md) \| [`OrchestratorGetTool`](../classes/OrchestratorGetTool.md) \| [`OrchestratorGetSettingsTool`](../classes/OrchestratorGetSettingsTool.md) \| [`OrchestratorCreateTool`](../classes/OrchestratorCreateTool.md) \| [`OrchestratorUpdateTool`](../classes/OrchestratorUpdateTool.md) \| [`OrchestratorUpdateSettingsTool`](../classes/OrchestratorUpdateSettingsTool.md) \| [`OrchestratorDeleteTool`](../classes/OrchestratorDeleteTool.md) \| [`OrchestratorUpdateStatusTool`](../classes/OrchestratorUpdateStatusTool.md) \| `StateGetAppTool` \| `StateAddAgentTool` \| `StateGetAgentTool` \| `StateGetProjectTool` \| `StateUpdateProjectTool` \| `ProjectGetSettingsTool` \| `ProjectGetPathTool` \| `ProjectGetRepoMapTool` \| `ProjectRunTool` \| `ProjectGetEditorStatusTool` \| `LLMInferenceTool` \| `LLMGetConfigTool` \| `MemoryJsonSaveTool` \| `MemoryJsonUpdateTool` \| `MemoryJsonDeleteTool` \| `MemoryJsonListTool` \| `MemoryTodoSaveTool` \| `MemoryTodoUpdateTool` \| `MemoryTodoDeleteTool` \| `MemoryTodoListTool` \| `MemoryMarkdownSaveTool` \| `MemoryMarkdownUpdateTool` \| `MemoryMarkdownDeleteTool` \| `MemoryMarkdownListTool` \| `EpisodicMemoryCreateTool` \| `EpisodicMemoryListTool` \| `EpisodicMemoryGetTool` \| `EpisodicMemoryAppendEventTool` \| `EpisodicMemoryQueryEventsTool` \| `EpisodicMemoryGetEventTypesTool` \| `EpisodicMemoryArchiveTool` \| `EpisodicMemoryUpdateTitleTool` \| `PersistentMemoryCreateTool` \| `PersistentMemoryGetTool` \| `PersistentMemoryListTool` \| `PersistentMemoryUpdateTool` \| `PersistentMemoryRetrieveTool` \| `TodoAddTool` \| `TodoUpdateTool` \| `TodoListTool` \| `TodoListIncompleteTool` \| `TodoExportTool` \| `TodoImportTool` \| `ChatGetHistoryTool` \| `ChatSendTool` \| `ChatWaitReplyTool` \| `ChatConfirmTool` \| `ChatAskTool` \| `ChatNotifyTool` \| `ChatStopProcessTool` \| `CapabilityListTool` \| `CapabilityListSkillsTool` \| `CapabilityListPowersTool` \| `CapabilityGetDetailTool` \| `CapabilityStartTool` \| `CapabilityStartSkillTool` \| `CapabilityStopTool` \| `CapabilityGetStatusTool` \| `MCPListServersTool` \| `MCPGetToolsTool` \| `MCPExecuteToolTool` \| `MCPConfigureServerTool` \| `KGTemplateCreateTool` \| `KGTemplateListTool` \| `KGTemplateGetTool` \| `KGTemplateDeleteTool` \| `KGInstanceCreateTool` \| `KGInstanceListTool` \| `KGInstanceGetTool` \| `KGInstanceDeleteTool` \| `KGRecordAddTool` \| `KGRecordListTool` \| `KGEdgeAddTool` \| `KGEdgeListTool` \| `PlanGetAllTool` \| `PlanGetDetailTool` \| `PlanCreateTool` \| `PlanUpdateTool` \| `PlanAddTaskTool` \| `PlanStartTaskTool` \| `RoadmapGetTool` \| `RoadmapGetPhasesTool` \| `RoadmapCreatePhaseTool` \| `RoadmapUpdatePhaseTool` \| `RoadmapDeletePhaseTool` \| `RoadmapGetFeaturesTool` \| `RoadmapCreateFeatureTool` \| `RoadmapUpdateFeatureTool` \| `RoadmapGetIdeasTool` \| `RoadmapCreateIdeaTool` \| `JobCreateTool` \| `JobGetTool` \| `JobUpdateTool` \| `JobDeleteTool` \| `JobListTool` \| `JobGroupCreateTool` \| `JobAddDependencyTool` \| `JobGetReadyTool` \| `JobGetBlockedTool` \| `JobLockTool` \| `JobUnlockTool` \| `JobBidAddTool` \| `CalendarCreateEventTool` \| `CalendarUpdateEventTool` \| `CalendarDeleteEventTool` \| `CalendarGetEventTool` \| `CalendarListEventsTool` \| `CalendarGetUpcomingTool` \| `CalendarMarkCompleteTool` \| `CalendarGetStatusTool` \| `TestSuiteCreateTool` \| `TestSuiteGetTool` \| `TestSuiteListTool` \| `TestSuiteUpdateTool` \| `TestSuiteDeleteTool` \| `TestCaseCreateTool` \| `TestCaseGetTool` \| `TestCaseListTool` \| `TestCaseUpdateTool` \| `TestRunCreateTool` \| `TestRunGetTool` \| `TestRunUpdateStatusTool` \| `FeedbackCreateTool` \| `FeedbackGetTool` \| `FeedbackListTool` \| `FeedbackRespondTool` \| `DeliberationCreateTool` \| `DeliberationGetTool` \| `DeliberationListTool` \| `DeliberationRespondTool` \| `DeliberationVoteTool` \| `PortfolioGetTool` \| `PortfolioAddTestimonialTool` \| `PortfolioAddKarmaTool` \| `PortfolioAddTalentTool` \| `PortfolioEndorseTalentTool` \| `PortfolioGetRankingTool` \| `ReviewCreateTool` \| `ReviewGetTool` \| `ReviewListTool` \| `ReviewUpdateTool` \| `ReviewSubmitTool` \| `ReviewApproveTool` \| `ReviewRequestChangesTool` \| `ReviewAddCommentTool` \| `OrchestratorListTool` \| `OrchestratorGetTool` \| `OrchestratorCreateTool` \| `OrchestratorUpdateTool` \| `CodemapListTool` \| `CodemapGetTool` \| `CodemapCreateTool` \| `CodemapUpdateTool` \| `HookCreateTool` \| `HookListTool` \| `HookGetTool` \| `HookEnableTool` \| `HookDisableTool` \| `EventLogCreateInstanceTool` \| `EventLogGetInstanceTool` \| `EventLogListInstancesTool` \| `EventLogAppendEventTool` \| `EventLogQueryEventsTool` \| `EventLogGetStatsTool` \| `ContextRuleCreateTool` \| `ContextRuleListTool` \| `ContextRuleEvaluateTool` \| `ContextRuleGetTool` \| `ContextRuleDeleteTool` \| `TokenizerAddTool` \| `TokenizerGetTool` \| `VectorGetTool` \| `VectorAddItemTool` \| `VectorQueryTool` \| `VectorQueryItemsTool` \| `DebugAddLogTool` \| `DebugOpenBrowserTool` \| `CodeUtilsGetFilesMarkdownTool` \| `CodeUtilsPerformMatchTool` \| `CodeUtilsGetMatcherListTool` \| `CodeUtilsMatchDetailTool` \| `HistorySummarizeAllTool` \| `HistorySummarizeTool` \| `DeliberationCreateTool` \| `DeliberationGetTool` \| `DeliberationListTool` \| `DeliberationUpdateTool` \| `DeliberationRespondTool` \| `DeliberationVoteTool` \| `DeliberationGetWinnerTool` \| `DeliberationSummaryTool` \| `PortfolioGetTool` \| `PortfolioGetConversationsTool` \| `PortfolioAddTestimonialTool` \| `PortfolioUpdateTestimonialTool` \| `PortfolioDeleteTestimonialTool` \| `PortfolioAddKarmaTool` \| `PortfolioGetKarmaHistoryTool` \| `PortfolioAddAppreciationTool` \| `PortfolioAddTalentTool` \| `PortfolioEndorseTalentTool` \| `PortfolioGetTalentsTool` \| `PortfolioGetRankingTool` \| `PortfolioGetByProjectTool` \| `PortfolioUpdateProfileTool` \| `CodebaseSearchTool` \| `CodebaseSearchMcpToolTool` \| `CodemapListTool` \| `CodemapGetTool` \| `CodemapCreateTool` \| `CodemapSaveTool` \| `CodemapSetStatusTool` \| `CodemapUpdateTool` \| `CodemapDeleteTool` \| `AddRunningAgentTool` \| `GetRunningAgentCountTool` \| `CheckBackgroundAgentCompletionTool` \| `OnBackgroundAgentCompletionTool` \| `ContextGetTool` \| `ContextValidateTool` \| `ContextListMemoryTypesTool` \| `ContextEvaluateRulesTool` \| `ContextGetRequiredVariablesTool` \| `RuleCreateTool` \| `RuleGetTool` \| `RuleListTool` \| `RuleUpdateTool` \| `RuleDeleteTool` \| `RuleEvaluateTool` \| `RuleGetPossibleVariablesTool` \| `FeedbackCreateTool` \| `FeedbackGetTool` \| `FeedbackListTool` \| `FeedbackRespondTool` \| `FeedbackReplyTool` \| `FeedbackUpdateSummaryTool` \| `FeedbackUpdateStatusTool` \| `AutoTestingCreateSuiteTool` \| `AutoTestingGetSuiteTool` \| `AutoTestingListSuitesTool` \| `AutoTestingUpdateSuiteTool` \| `AutoTestingDeleteSuiteTool` \| `AutoTestingAddCaseToSuiteTool` \| `AutoTestingRemoveCaseFromSuiteTool` \| `AutoTestingCreateCaseTool` \| `AutoTestingGetCaseTool` \| `AutoTestingListCasesTool` \| `AutoTestingUpdateCaseTool` \| `AutoTestingDeleteCaseTool` \| `AutoTestingCreateRunTool` \| `AutoTestingGetRunTool` \| `AutoTestingListRunsTool` \| `AutoTestingUpdateRunStatusTool` \| `AutoTestingUpdateRunCaseTool` \| `AutoTestingUpdateRunStepTool` \| `EpisodicCreateMemoryTool` \| `EpisodicListMemoriesTool` \| `EpisodicGetMemoryTool` \| `EpisodicAppendEventTool` \| `EpisodicQueryEventsTool` \| `EpisodicGetEventTypesTool` \| `EpisodicGetTagsTool` \| `EpisodicGetAgentsTool` \| `EpisodicArchiveMemoryTool` \| `EpisodicUnarchiveMemoryTool` \| `EpisodicUpdateTitleTool` \| `EventLogCreateInstanceTool` \| `EventLogGetInstanceTool` \| `EventLogListInstancesTool` \| `EventLogUpdateInstanceTool` \| `EventLogDeleteInstanceTool` \| `EventLogAppendEventTool` \| `EventLogAppendEventsTool` \| `EventLogQueryEventsTool` \| `EventLogGetInstanceStatsTool` \| `FsCreateFileTool` \| `FsCreateFolderTool` \| `FsReadFileTool` \| `FsUpdateFileTool` \| `FsDeleteFileTool` \| `FsDeleteFolderTool` \| `FsListFileTool` \| `FsGrepSearchTool` \| `FsFileSearchTool` \| `FsSearchFilesTool` \| `FsReadManyFilesTool` \| `FsListDirectoryTool` \| `FsListCodeDefinitionsTool` \| `HookInitializeTool` \| `HookCreateTool` \| `HookUpdateTool` \| `HookDeleteTool` \| `HookListTool` \| `HookGetTool` \| `HookEnableTool` \| `HookDisableTool` \| `KGCreateInstanceTemplateTool` \| `KGGetInstanceTemplateTool` \| `KGListInstanceTemplatesTool` \| `KGUpdateInstanceTemplateTool` \| `KGDeleteInstanceTemplateTool` \| `KGCreateInstanceTool` \| `KGGetInstanceTool` \| `KGListInstancesTool` \| `KGDeleteInstanceTool` \| `KGAddMemoryRecordTool` \| `KGAddMemoryRecordsTool` \| `KGGetMemoryRecordTool` \| `KGListMemoryRecordsTool` \| `KGUpdateMemoryRecordTool` \| `KGDeleteMemoryRecordTool` \| `KGAddEdgeTool` \| `KGAddEdgesTool` \| `KGListEdgesTool` \| `KGDeleteEdgeTool` \| `KGCreateViewTemplateTool` \| `KGGetViewTemplateTool` \| `KGListViewTemplatesTool` \| `KGUpdateViewTemplateTool` \| `KGDeleteViewTemplateTool` \| `KGCreateViewTool` \| `KGListViewsTool` \| `KGExecuteViewTool` \| `KGDeleteViewTool` \| `OutputParsersParseJSONTool` \| `OutputParsersParseXMLTool` \| `OutputParsersParseCSVTool` \| `OutputParsersParseTextTool` \| `OutputParsersParseErrorsTool` \| `OutputParsersParseWarningsTool` \| `PersistentMemoryCreateTool` \| `PersistentMemoryGetTool` \| `PersistentMemoryListTool` \| `PersistentMemoryUpdateTool` \| `PersistentMemoryDeleteTool` \| `PersistentMemoryExecuteRetrievalTool` \| `PersistentMemoryValidateTool` \| `PersistentMemoryGetStepSpecsTool` \| `UpdateRequestCreateTool` \| `UpdateRequestGetTool` \| `UpdateRequestListTool` \| `UpdateRequestUpdateTool` \| `UpdateRequestDeleteTool` \| `UpdateRequestSubmitTool` \| `UpdateRequestStartWorkTool` \| `UpdateRequestCompleteTool` \| `UpdateRequestMergeTool` \| `UpdateRequestAddDisputeTool` \| `UpdateRequestResolveDisputeTool` \| `UpdateRequestAddCommentTool` \| `UpdateRequestWatchTool` \| `UpdateRequestUnwatchTool` \| `RequirementPlanCreateTool` \| `RequirementPlanGetTool` \| `RequirementPlanUpdateTool` \| `RequirementPlanListTool` \| `RequirementPlanAddSectionTool` \| `RequirementPlanUpdateSectionTool` \| `RequirementPlanRemoveSectionTool` \| `RequirementPlanReorderSectionsTool` \| `RequirementPlanReviewTool` \| `UserMessageGetCurrentTool` \| `UserMessageGetTextTool` \| `UserMessageGetConfigTool` \| `UserMessageGetMentionedFilesTool` \| `UserUtilitiesGetCurrentTool` \| `UserUtilitiesGetTextTool` \| `UserUtilitiesGetMentionedMCPsTool` \| `UserUtilitiesGetMentionedFilesTool` \| `UserUtilitiesGetCurrentFileTool` \| `UserUtilitiesGetSelectionTool`)[]

### getFunctionCallSchemas()

> **getFunctionCallSchemas**: () => [`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)[]

Get function call schemas for all tools

#### Returns

[`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)[]

### getRegistry()

> **getRegistry**: () => [`ToolRegistry`](../classes/ToolRegistry.md)

Get the tool registry

#### Returns

[`ToolRegistry`](../classes/ToolRegistry.md)

### getTool()

> **getTool**: (`name`) => `undefined` \| [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)

Get a specific tool by name

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)

### getToolNames()

> **getToolNames**: () => `string`[]

Get tool names

#### Returns

`string`[]

### getToolSchemas()

> **getToolSchemas**: () => [`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)[]

Get OpenAI-compatible tool schemas for all tools

#### Returns

[`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)[]

### git

> **git**: ([`GitInitTool`](../classes/GitInitTool.md) \| [`GitStatusTool`](../classes/GitStatusTool.md) \| [`GitAddTool`](../classes/GitAddTool.md) \| [`GitCommitTool`](../classes/GitCommitTool.md) \| [`GitPushTool`](../classes/GitPushTool.md) \| [`GitPullTool`](../classes/GitPullTool.md) \| [`GitCheckoutTool`](../classes/GitCheckoutTool.md) \| [`GitBranchTool`](../classes/GitBranchTool.md) \| [`GitLogsTool`](../classes/GitLogsTool.md) \| [`GitDiffTool`](../classes/GitDiffTool.md) \| [`GitCloneTool`](../classes/GitCloneTool.md))[] = `gitTools`

### groupFeedback

> **groupFeedback**: (`FeedbackCreateTool` \| `FeedbackGetTool` \| `FeedbackListTool` \| `FeedbackRespondTool` \| `FeedbackReplyTool` \| `FeedbackUpdateSummaryTool` \| `FeedbackUpdateStatusTool`)[] = `groupFeedbackTools`

### hasTool()

> **hasTool**: (`name`) => `boolean`

Check if a tool exists

#### Parameters

##### name

`string`

#### Returns

`boolean`

### history

> **history**: (`HistorySummarizeAllTool` \| `HistorySummarizeTool`)[] = `historyTools`

### hook

> **hook**: (`HookInitializeTool` \| `HookCreateTool` \| `HookUpdateTool` \| `HookDeleteTool` \| `HookListTool` \| `HookGetTool` \| `HookEnableTool` \| `HookDisableTool`)[] = `hookTools`

### job

> **job**: (`JobCreateTool` \| `JobGetTool` \| `JobUpdateTool` \| `JobDeleteTool` \| `JobListTool` \| `JobGroupCreateTool` \| `JobAddDependencyTool` \| `JobGetReadyTool` \| `JobGetBlockedTool` \| `JobLockTool` \| `JobUnlockTool` \| `JobBidAddTool`)[] = `jobTools`

### knowledge

> **knowledge**: (`KGTemplateCreateTool` \| `KGTemplateListTool` \| `KGTemplateGetTool` \| `KGTemplateDeleteTool` \| `KGInstanceCreateTool` \| `KGInstanceListTool` \| `KGInstanceGetTool` \| `KGInstanceDeleteTool` \| `KGRecordAddTool` \| `KGRecordListTool` \| `KGEdgeAddTool` \| `KGEdgeListTool`)[] = `knowledgeTools`

### knowledgeGraph

> **knowledgeGraph**: (`KGCreateInstanceTemplateTool` \| `KGGetInstanceTemplateTool` \| `KGListInstanceTemplatesTool` \| `KGUpdateInstanceTemplateTool` \| `KGDeleteInstanceTemplateTool` \| `KGCreateInstanceTool` \| `KGGetInstanceTool` \| `KGListInstancesTool` \| `KGDeleteInstanceTool` \| `KGAddMemoryRecordTool` \| `KGAddMemoryRecordsTool` \| `KGGetMemoryRecordTool` \| `KGListMemoryRecordsTool` \| `KGUpdateMemoryRecordTool` \| `KGDeleteMemoryRecordTool` \| `KGAddEdgeTool` \| `KGAddEdgesTool` \| `KGListEdgesTool` \| `KGDeleteEdgeTool` \| `KGCreateViewTemplateTool` \| `KGGetViewTemplateTool` \| `KGListViewTemplatesTool` \| `KGUpdateViewTemplateTool` \| `KGDeleteViewTemplateTool` \| `KGCreateViewTool` \| `KGListViewsTool` \| `KGExecuteViewTool` \| `KGDeleteViewTool`)[] = `knowledgeGraphTools`

### llm

> **llm**: (`LLMInferenceTool` \| `LLMGetConfigTool`)[] = `llmTools`

### mcp

> **mcp**: (`MCPListServersTool` \| `MCPGetToolsTool` \| `MCPExecuteToolTool` \| `MCPConfigureServerTool`)[] = `mcpTools`

### memory

> **memory**: (`MemoryJsonSaveTool` \| `MemoryJsonUpdateTool` \| `MemoryJsonDeleteTool` \| `MemoryJsonListTool` \| `MemoryTodoSaveTool` \| `MemoryTodoUpdateTool` \| `MemoryTodoDeleteTool` \| `MemoryTodoListTool` \| `MemoryMarkdownSaveTool` \| `MemoryMarkdownUpdateTool` \| `MemoryMarkdownDeleteTool` \| `MemoryMarkdownListTool` \| `EpisodicMemoryCreateTool` \| `EpisodicMemoryListTool` \| `EpisodicMemoryGetTool` \| `EpisodicMemoryAppendEventTool` \| `EpisodicMemoryQueryEventsTool` \| `EpisodicMemoryGetEventTypesTool` \| `EpisodicMemoryArchiveTool` \| `EpisodicMemoryUpdateTitleTool` \| `PersistentMemoryCreateTool` \| `PersistentMemoryGetTool` \| `PersistentMemoryListTool` \| `PersistentMemoryUpdateTool` \| `PersistentMemoryRetrieveTool`)[] = `memoryTools`

### orchestrator

> **orchestrator**: ([`OrchestratorListTool`](../classes/OrchestratorListTool.md) \| [`OrchestratorGetTool`](../classes/OrchestratorGetTool.md) \| [`OrchestratorGetSettingsTool`](../classes/OrchestratorGetSettingsTool.md) \| [`OrchestratorCreateTool`](../classes/OrchestratorCreateTool.md) \| [`OrchestratorUpdateTool`](../classes/OrchestratorUpdateTool.md) \| [`OrchestratorUpdateSettingsTool`](../classes/OrchestratorUpdateSettingsTool.md) \| [`OrchestratorDeleteTool`](../classes/OrchestratorDeleteTool.md) \| [`OrchestratorUpdateStatusTool`](../classes/OrchestratorUpdateStatusTool.md))[] = `orchestratorTools`

### outputParsers

> **outputParsers**: (`OutputParsersParseJSONTool` \| `OutputParsersParseXMLTool` \| `OutputParsersParseCSVTool` \| `OutputParsersParseTextTool` \| `OutputParsersParseErrorsTool` \| `OutputParsersParseWarningsTool`)[] = `outputParsersTools`

### persistentMemory

> **persistentMemory**: (`PersistentMemoryCreateTool` \| `PersistentMemoryGetTool` \| `PersistentMemoryListTool` \| `PersistentMemoryUpdateTool` \| `PersistentMemoryDeleteTool` \| `PersistentMemoryExecuteRetrievalTool` \| `PersistentMemoryValidateTool` \| `PersistentMemoryGetStepSpecsTool`)[] = `persistentMemoryTools`

### planning

> **planning**: (`PlanGetAllTool` \| `PlanGetDetailTool` \| `PlanCreateTool` \| `PlanUpdateTool` \| `PlanAddTaskTool` \| `PlanStartTaskTool` \| `RoadmapGetTool` \| `RoadmapGetPhasesTool` \| `RoadmapCreatePhaseTool` \| `RoadmapUpdatePhaseTool` \| `RoadmapDeletePhaseTool` \| `RoadmapGetFeaturesTool` \| `RoadmapCreateFeatureTool` \| `RoadmapUpdateFeatureTool` \| `RoadmapGetIdeasTool` \| `RoadmapCreateIdeaTool`)[] = `planningTools`

### project

> **project**: (`ProjectGetSettingsTool` \| `ProjectGetPathTool` \| `ProjectGetRepoMapTool` \| `ProjectRunTool` \| `ProjectGetEditorStatusTool`)[] = `projectTools`

### projectStructureUpdateRequest

> **projectStructureUpdateRequest**: (`UpdateRequestCreateTool` \| `UpdateRequestGetTool` \| `UpdateRequestListTool` \| `UpdateRequestUpdateTool` \| `UpdateRequestDeleteTool` \| `UpdateRequestSubmitTool` \| `UpdateRequestStartWorkTool` \| `UpdateRequestCompleteTool` \| `UpdateRequestMergeTool` \| `UpdateRequestAddDisputeTool` \| `UpdateRequestResolveDisputeTool` \| `UpdateRequestAddCommentTool` \| `UpdateRequestWatchTool` \| `UpdateRequestUnwatchTool`)[] = `projectStructureUpdateRequestTools`

### rag

> **rag**: (`RAGAddFileTool` \| `RAGRetrieveKnowledgeTool`)[] = `ragTools`

### requirementPlan

> **requirementPlan**: (`RequirementPlanCreateTool` \| `RequirementPlanGetTool` \| `RequirementPlanUpdateTool` \| `RequirementPlanListTool` \| `RequirementPlanAddSectionTool` \| `RequirementPlanUpdateSectionTool` \| `RequirementPlanRemoveSectionTool` \| `RequirementPlanReorderSectionsTool` \| `RequirementPlanReviewTool`)[] = `requirementPlanTools`

### review

> **review**: (`ReviewCreateTool` \| `ReviewGetTool` \| `ReviewListTool` \| `ReviewUpdateTool` \| `ReviewSubmitTool` \| `ReviewApproveTool` \| `ReviewRequestChangesTool` \| `ReviewAddCommentTool`)[] = `reviewTools`

### search

> **search**: ([`GlobTool`](../classes/GlobTool.md) \| [`GrepTool`](../classes/GrepTool.md) \| [`SearchFilesTool`](../classes/SearchFilesTool.md) \| [`CodebaseSearchTool`](../classes/CodebaseSearchTool.md) \| [`SearchMcpToolTool`](../classes/SearchMcpToolTool.md) \| [`ListCodeDefinitionNamesTool`](../classes/ListCodeDefinitionNamesTool.md))[] = `searchTools`

### state

> **state**: (`StateGetAppTool` \| `StateAddAgentTool` \| `StateGetAgentTool` \| `StateGetProjectTool` \| `StateUpdateProjectTool`)[] = `stateTools`

### task

> **task**: ([`TaskCreateTool`](../classes/TaskCreateTool.md) \| [`TaskUpdateTool`](../classes/TaskUpdateTool.md) \| [`TaskDeleteTool`](../classes/TaskDeleteTool.md) \| [`TaskListTool`](../classes/TaskListTool.md) \| [`TaskGetTool`](../classes/TaskGetTool.md) \| [`TaskAssignTool`](../classes/TaskAssignTool.md) \| [`TaskExecuteTool`](../classes/TaskExecuteTool.md))[] = `taskTools`

### terminal

> **terminal**: [`ExecuteCommandTool`](../classes/ExecuteCommandTool.md)[] = `terminalTools`

### testing

> **testing**: (`TestSuiteCreateTool` \| `TestSuiteGetTool` \| `TestSuiteListTool` \| `TestSuiteUpdateTool` \| `TestSuiteDeleteTool` \| `TestCaseCreateTool` \| `TestCaseGetTool` \| `TestCaseListTool` \| `TestCaseUpdateTool` \| `TestRunCreateTool` \| `TestRunGetTool` \| `TestRunUpdateStatusTool`)[] = `testingTools`

### thread

> **thread**: ([`ThreadCreateTool`](../classes/ThreadCreateTool.md) \| [`ThreadCreateStartTool`](../classes/ThreadCreateStartTool.md) \| [`ThreadCreateBackgroundTool`](../classes/ThreadCreateBackgroundTool.md) \| [`ThreadListTool`](../classes/ThreadListTool.md) \| [`ThreadGetTool`](../classes/ThreadGetTool.md) \| [`ThreadStartTool`](../classes/ThreadStartTool.md) \| [`ThreadUpdateTool`](../classes/ThreadUpdateTool.md) \| [`ThreadDeleteTool`](../classes/ThreadDeleteTool.md) \| [`ThreadGetMessagesTool`](../classes/ThreadGetMessagesTool.md) \| [`ThreadUpdateStatusTool`](../classes/ThreadUpdateStatusTool.md))[] = `threadTools`

### todo

> **todo**: (`TodoAddTool` \| `TodoUpdateTool` \| `TodoListTool` \| `TodoListIncompleteTool` \| `TodoExportTool` \| `TodoImportTool`)[] = `todoTools`

### tokenizer

> **tokenizer**: (`TokenizerAddTool` \| `TokenizerGetTool`)[] = `tokenizerTools`

### userMessageManager

> **userMessageManager**: (`UserMessageGetCurrentTool` \| `UserMessageGetTextTool` \| `UserMessageGetConfigTool` \| `UserMessageGetMentionedFilesTool`)[] = `userMessageManagerTools`

### userMessageUtilities

> **userMessageUtilities**: (`UserUtilitiesGetCurrentTool` \| `UserUtilitiesGetTextTool` \| `UserUtilitiesGetMentionedMCPsTool` \| `UserUtilitiesGetMentionedFilesTool` \| `UserUtilitiesGetCurrentFileTool` \| `UserUtilitiesGetSelectionTool`)[] = `userMessageUtilitiesTools`

### utils

> **utils**: `UtilsEditFileAndApplyDiffTool`[] = `utilsTools`

### vectordb

> **vectordb**: (`VectorGetTool` \| `VectorAddItemTool` \| `VectorQueryTool` \| `VectorQueryItemsTool`)[] = `vectordbTools`

### webSearch

> **webSearch**: (`WebSearchTool` \| `GetFirstLinkTool`)[] = `webSearchTools`
