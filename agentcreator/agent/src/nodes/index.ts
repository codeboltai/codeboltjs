// Backend execution nodes and Constants nodes
export * from './Constants/index.js';

// Base nodes
export { TimeNode } from './Utility/TimeNode.js';

// Utility nodes
export { RandomNode } from './Utility/RandomNode.js';
export { DelayNode } from './Utility/DelayNode.js';
export { LoggerNode } from './Utility/LoggerNode.js';

// Math nodes
export {
  BypassNode,
  ToNumberNode,
  RandNode,
  AbsNode,
  ClampNode,
  SumNode,
  RangeNode,
  LerpNode,
  FloorNode,
  FracNode,
  SmoothStepNode,
  ScaleNode,
  GateNode,
  OperationNode,
  ConverterNode
} from './Math/index.js';

// Logic nodes
export {
  AndNode,
  OrNode,
  NotNode,
  SelectorNode,
  SequenceNode,
  BranchNode
} from './Logical/index.js';

// String nodes
export * from './String/index.js';

// Variable nodes
export {
  GetStringVariableNode,
  SetStringVariableNode
} from './Variables/index.js';

// Widget nodes
export { MarkdownNode } from './Assets/MarkdownNode.js';

// Codebolt nodes
export * from './BaseCodeboltApis/index.js';
export * from './BaseCodeboltNotifications/index.js';

// Unified Agent nodes
export * from './CodeboltAgentUnifiedMode/index.js';

// AI Agent nodes - now exported from Unified Mode

// Backend node registration utility
import { LiteGraph } from '@codebolt/litegraph';
import { registerNodeWithMetadata } from '@codebolt/agent-shared-nodes';
import { ConstNode as BackendConstNode } from './Constants/index.js';
import { TimeNode as BackendTimeNode } from './Utility/TimeNode.js';
import { ConstantNumberNode as BackendConstantNumberNode } from './Constants/index.js';
import {
  BypassNode as BackendBypassNode,
  ToNumberNode as BackendToNumberNode,
  RandNode as BackendRandNode,
  AbsNode as BackendAbsNode,
  ClampNode as BackendClampNode,
  SumNode as BackendSumNode,
  RangeNode as BackendRangeNode,
  LerpNode as BackendLerpNode,
  FloorNode as BackendFloorNode,
  FracNode as BackendFracNode,
  SmoothStepNode as BackendSmoothStepNode,
  ScaleNode as BackendScaleNode,
  GateNode as BackendGateNode,
  OperationNode as BackendOperationNode,
  ConverterNode as BackendConverterNode
} from './Math/index.js';
import {
  AndNode as BackendAndNode,
  OrNode as BackendOrNode,
  NotNode as BackendNotNode,
  SelectorNode as BackendSelectorNode,
  SequenceNode as BackendSequenceNode,
  BranchNode as BackendBranchNode
} from './Logical/index.js';
import * as BackendStringNodes from './String/index.js';
import {
  GetStringVariableNode as BackendGetStringVariableNode,
  SetStringVariableNode as BackendSetStringVariableNode
} from './Variables/index.js';
import { MarkdownNode as BackendMarkdownNode } from './Assets/MarkdownNode.js';
import { OnMessageNode as BackendOnMessageNode } from './BaseCodeboltApis/events/OnMessageNode.js';
import {
  SendMessageNode as BackendSendMessageNode,
  GetChatHistoryNode as BackendGetChatHistoryNode,
  WaitForReplyNode as BackendWaitForReplyNode,
  ProcessStartedNode as BackendProcessStartedNode,
  StopProcessNode as BackendStopProcessNode,
  ProcessFinishedNode as BackendProcessFinishedNode,
  SendConfirmationRequestNode as BackendSendConfirmationRequestNode,
  AskQuestionNode as BackendAskQuestionNode,
  SendNotificationEventNode as BackendSendNotificationEventNode
} from './BaseCodeboltApis/chat/index.js';
import {
  ReadFileNode as BackendReadFileNode,
  WriteToFileNode as BackendWriteToFileNode,
  CreateFileNode as BackendCreateFileNode,
  ListFileNode as BackendListFileNode,
  CreateFolderNode as BackendCreateFolderNode,
  UpdateFileNode as BackendUpdateFileNode,
  DeleteFileNode as BackendDeleteFileNode,
  DeleteFolderNode as BackendDeleteFolderNode,
  SearchFilesNode as BackendSearchFilesNode,
  GrepSearchNode as BackendGrepSearchNode,
  FileSearchNode as BackendFileSearchNode,
  EditFileWithDiffNode as BackendEditFileWithDiffNode,
  ReadManyFilesNode as BackendReadManyFilesNode,
  ListDirectoryNode as BackendListDirectoryNode
} from './BaseCodeboltApis/fs/index.js';
import {
  GetAllPlansNode as BackendGetAllPlansNode,
  GetPlanDetailNode as BackendGetPlanDetailNode,
  GetActionPlanDetailNode as BackendGetActionPlanDetailNode,
  CreateActionPlanNode as BackendCreateActionPlanNode,
  UpdateActionPlanNode as BackendUpdateActionPlanNode,
  AddTaskToActionPlanNode as BackendAddTaskToActionPlanNode,
  StartTaskStepNode as BackendStartTaskStepNode,
  StartTaskStepWithListenerNode as BackendStartTaskStepWithListenerNode
} from './BaseCodeboltApis/actionPlan/index.js';
import {
  GitInitNode as BackendGitInitNode,
  GitPullNode as BackendGitPullNode,
  GitPushNode as BackendGitPushNode,
  GitStatusNode as BackendGitStatusNode,
  GitAddNode as BackendGitAddNode,
  GitCommitNode as BackendGitCommitNode,
  GitCheckoutNode as BackendGitCheckoutNode,
  GitBranchNode as BackendGitBranchNode,
  GitLogsNode as BackendGitLogsNode,
  GitDiffNode as BackendGitDiffNode
} from './BaseCodeboltApis/git/index.js';
import {
  ExecuteCommandNode as BackendExecuteCommandNode,
  ExecuteCommandRunUntilErrorNode as BackendExecuteCommandRunUntilErrorNode,
  SendManualInterruptNode as BackendSendManualInterruptNode,
  ExecuteCommandWithStreamNode as BackendExecuteCommandWithStreamNode
} from './BaseCodeboltApis/terminal/index.js';
import {
  FindAgentNode as BackendFindAgentNode,
  StartAgentNode as BackendStartAgentNode,
  ListAgentsNode as BackendListAgentsNode,
  AgentsDetailNode as BackendAgentsDetailNode
} from './BaseCodeboltApis/agent/index.js';
import {
  CrawlerStartNode as BackendCrawlerStartNode,
  CrawlerScreenshotNode as BackendCrawlerScreenshotNode,
  CrawlerGoToPageNode as BackendCrawlerGoToPageNode,
  CrawlerScrollNode as BackendCrawlerScrollNode,
  CrawlerClickNode as BackendCrawlerClickNode
} from './BaseCodeboltApis/crawler/index.js';
import {
  BackendAddFileNode,
  BackendRetrieveRelatedKnowledgeNode
} from './BaseCodeboltApis/rag/index.js';
import {
  GetAllFilesAsMarkDownNode as BackendGetAllFilesAsMarkDownNode,
  PerformMatchNode as BackendPerformMatchNode,
  GetMatcherListNode as BackendGetMatcherListNode,
  MatchDetailNode as BackendMatchDetailNode
} from './BaseCodeboltApis/codeutils/index.js';

import {
  MemoryAddNode as BackendMemoryAddNode,
  MemoryGetNode as BackendMemoryGetNode,
  MemoryJsonSaveNode as BackendMemoryJsonSaveNode,
  MemoryJsonUpdateNode as BackendMemoryJsonUpdateNode,
  MemoryJsonDeleteNode as BackendMemoryJsonDeleteNode,
  MemoryJsonListNode as BackendMemoryJsonListNode,
  MemoryTodoSaveNode as BackendMemoryTodoSaveNode,
  MemoryTodoUpdateNode as BackendMemoryTodoUpdateNode,
  MemoryTodoDeleteNode as BackendMemoryTodoDeleteNode,
  MemoryTodoListNode as BackendMemoryTodoListNode,
  MemoryMarkdownSaveNode as BackendMemoryMarkdownSaveNode,
  MemoryMarkdownUpdateNode as BackendMemoryMarkdownUpdateNode,
  MemoryMarkdownDeleteNode as BackendMemoryMarkdownDeleteNode,
  MemoryMarkdownListNode as BackendMemoryMarkdownListNode
} from './BaseCodeboltApis/memory/index.js';
import {
  SummarizeAllNode as BackendSummarizeAllNode,
  SummarizePartNode as BackendSummarizePartNode
} from './BaseCodeboltApis/history/index.js';
import {
  InferenceNode as BackendInferenceNode,
  GetModelConfigNode as BackendGetModelConfigNode
} from './BaseCodeboltApis/llm/index.js';
import {
  MCPGetEnabledNode as BackendMCPGetEnabledNode,
  MCPLocalServersNode as BackendMCPLocalServersNode,
  MCPMentionedServersNode as BackendMCPMentionedServersNode,
  MCPSearchServersNode as BackendMCPSearchServersNode,
  MCPListToolsNode as BackendMCPListToolsNode,
  MCPConfigureNode as BackendMCPConfigureNode,
  MCPGetToolsNode as BackendMCPGetToolsNode,
  MCPExecuteToolNode as BackendMCPExecuteToolNode
} from './BaseCodeboltApis/mcp/index.js';
import {
  SearchNode as BackendSearchNode,
  GetFirstLinkNode as BackendGetFirstLinkNode
} from './BaseCodeboltApis/search/index.js';
import {
  DebugNode as BackendDebugNode,
  OpenDebugBrowserNode as BackendOpenDebugBrowserNode
} from './BaseCodeboltApis/debug/index.js';
import {
  CreateTaskNode as BackendCreateTaskNode,
  GetTaskListNode as BackendGetTaskListNode,
  StartTaskNode as BackendStartTaskNode,
  CompleteTaskNode as BackendCompleteTaskNode,
  DeleteTaskNode as BackendDeleteTaskNode,
  UpdateTaskNode as BackendUpdateTaskNode,
  GetTaskDetailNode as BackendGetTaskDetailNode,
  AddStepToTaskNode as BackendAddStepToTaskNode,
  GetTaskMessagesNode as BackendGetTaskMessagesNode,
  GetAllStepsNode as BackendGetAllStepsNode,
  GetCurrentRunningStepNode as BackendGetCurrentRunningStepNode,
  UpdateStepStatusNode as BackendUpdateStepStatusNode,
  CompleteStepNode as BackendCompleteStepNode,
  SendSteeringMessageNode as BackendSendSteeringMessageNode,
  CanTaskStartNode as BackendCanTaskStartNode,
  GetTasksDependentOnNode as BackendGetTasksDependentOnNode,
  GetTasksReadyToStartNode as BackendGetTasksReadyToStartNode,
  GetTaskDependencyChainNode as BackendGetTaskDependencyChainNode,
  GetTaskStatsNode as BackendGetTaskStatsNode,
  GetTasksStartedByMeNode as BackendGetTasksStartedByMeNode,
  AttachMemoryToTaskNode as BackendAttachMemoryToTaskNode,
  GetAttachedMemoryForTaskNode as BackendGetAttachedMemoryForTaskNode,
  CreateTaskGroupNode as BackendCreateTaskGroupNode
} from './BaseCodeboltApis/task/index.js';
import {
  GetApplicationStateNode as BackendGetApplicationStateNode,
  AddToAgentStateNode as BackendAddToAgentStateNode,
  GetAgentStateNode as BackendGetAgentStateNode,
  GetProjectStateNode as BackendGetProjectStateNode,
  UpdateProjectStateNode as BackendUpdateProjectStateNode
} from './BaseCodeboltApis/state/index.js';
import {
  GetCurrentUserMessageNode as BackendGetCurrentUserMessageNode,
  GetUserMessageTextNode as BackendGetUserMessageTextNode,
  HasCurrentUserMessageNode as BackendHasCurrentUserMessageNode,
  ClearUserMessageNode as BackendClearUserMessageNode,
  GetMentionedFilesNode as BackendGetMentionedFilesNode,
  GetMentionedMCPsNode as BackendGetMentionedMCPsNode,
  GetCurrentFileNode as BackendGetCurrentFileNode,
  GetSelectionNode as BackendGetSelectionNode,
  GetRemixPromptNode as BackendGetRemixPromptNode,
  GetUploadedImagesNode as BackendGetUploadedImagesNode,
  SetUserSessionDataNode as BackendSetUserSessionDataNode,
  GetUserSessionDataNode as BackendGetUserSessionDataNode
} from './BaseCodeboltApis/user-message-manager/index.js';
import {
  GetVectorNode as BackendGetVectorNode,
  AddVectorItemNode as BackendAddVectorItemNode,
  QueryVectorItemNode as BackendQueryVectorItemNode,
  QueryVectorItemsNode as BackendQueryVectorItemsNode
} from './BaseCodeboltApis/vectordb/index.js';
import {
  EditFileAndApplyDiffNode as BackendEditFileAndApplyDiffNode
} from './BaseCodeboltApis/utils/index.js';
import {
  AddTokenNode as BackendAddTokenNode,
  GetTokenNode as BackendGetTokenNode
} from './BaseCodeboltApis/tokenizer/index.js';
import {
  ParseJSONNode as BackendParseJSONNode,
  ParseXMLNode as BackendParseXMLNode,
  ParseCSVNode as BackendParseCSVNode,
  ParseTextNode as BackendParseTextNode,
  ParseErrorsNode as BackendParseErrorsNode,
  ParseWarningsNode as BackendParseWarningsNode
} from './BaseCodeboltApis/outputparsers/index.js';

// Unified Agent nodes
import {
  AgentNode as BackendAgentUnifiedNode,
  AgentStepNode as BackendAgentStepNode,
  InitialPromptGeneratorNode as BackendInitialPromptGeneratorNode,
  ResponseExecutorNode as BackendResponseExecutorNode,
  ToolNode as BackendToolNode,
  WorkflowNode as BackendWorkflowNode,
  MessageProcessorNode as BackendMessageProcessorNode
} from './CodeboltAgentUnifiedMode/index.js';

// Notification nodes
import {
  LLMInferenceRequestNode as BackendLLMInferenceRequestNode,
  LLMInferenceResponseNode as BackendLLMInferenceResponseNode,
  LLMGetTokenCountNode as BackendLLMGetTokenCountNode,
  LLMSendTokenCountResponseNode as BackendLLMSendTokenCountResponseNode
} from './BaseCodeboltNotifications/llm/index.js';
import {
  WebFetchRequestNode as BackendWebFetchRequestNode,
  WebFetchResponseNode as BackendWebFetchResponseNode,
  WebSearchRequestNode as BackendWebSearchRequestNode,
  WebSearchResponseNode as BackendWebSearchResponseNode
} from './BaseCodeboltNotifications/browser/index.js';
import {
  GetEnabledMCPServersRequestNode as BackendGetEnabledMCPServersRequestNode,
  GetEnabledMCPServersResultNode as BackendGetEnabledMCPServersResultNode,
  ListToolsFromMCPServersRequestNode as BackendListToolsFromMCPServersRequestNode,
  ListToolsFromMCPServersResultNode as BackendListToolsFromMCPServersResultNode,
  GetToolsRequestNode as BackendGetToolsRequestNode,
  GetToolsResultNode as BackendGetToolsResultNode,
  ExecuteToolRequestNode as BackendExecuteToolRequestNode,
  ExecuteToolResultNode as BackendExecuteToolResultNode
} from './BaseCodeboltNotifications/mcp/index.js';
import {
  CrawlerSearchRequestNode as BackendCrawlerSearchRequestNode,
  CrawlerSearchResponseNode as BackendCrawlerSearchResponseNode,
  CrawlerStartRequestNode as BackendCrawlerStartRequestNode,
  CrawlerStartResponseNode as BackendCrawlerStartResponseNode
} from './BaseCodeboltNotifications/crawler/index.js';

// Constants nodes
import { ConstantStringNode as BackendConstantStringNode } from './Constants/index.js';
import { ConstantBooleanNode as BackendConstantBooleanNode } from './Constants/index.js';
import { ConstantObjectNode as BackendConstantObjectNode } from './Constants/index.js';

// Utility nodes
import { RandomNode as BackendRandomNode } from './Utility/RandomNode.js';
import { DelayNode as BackendDelayNode } from './Utility/DelayNode.js';
import { LoggerNode as BackendLoggerNode } from './Utility/LoggerNode.js';

export function registerBackendNodes() {
  // Register backend execution nodes
  registerNodeWithMetadata(LiteGraph, BackendConstNode, BackendConstNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSumNode, BackendSumNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendTimeNode, BackendTimeNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendConstantNumberNode, BackendConstantNumberNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendConstantStringNode, BackendConstantStringNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendConstantBooleanNode, BackendConstantBooleanNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendConstantObjectNode, BackendConstantObjectNode.metadata);

  // Utility nodes
  registerNodeWithMetadata(LiteGraph, BackendRandomNode, BackendRandomNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendDelayNode, BackendDelayNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendLoggerNode, BackendLoggerNode.metadata);

  registerNodeWithMetadata(LiteGraph, BackendBypassNode, BackendBypassNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendToNumberNode, BackendToNumberNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendRandNode, BackendRandNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAbsNode, BackendAbsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendClampNode, BackendClampNode.metadata);

  // Register additional Math nodes
  registerNodeWithMetadata(LiteGraph, BackendSumNode, BackendSumNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendRangeNode, BackendRangeNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendLerpNode, BackendLerpNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendFloorNode, BackendFloorNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendFracNode, BackendFracNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSmoothStepNode, BackendSmoothStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendScaleNode, BackendScaleNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGateNode, BackendGateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendOperationNode, BackendOperationNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendConverterNode, BackendConverterNode.metadata);

  // Register Logical nodes
  registerNodeWithMetadata(LiteGraph, BackendAndNode, BackendAndNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendOrNode, BackendOrNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendNotNode, BackendNotNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSelectorNode, BackendSelectorNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSequenceNode, BackendSequenceNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendBranchNode, BackendBranchNode.metadata);
  // String nodes are registered via export * from './String' - they handle their own registration
  registerNodeWithMetadata(LiteGraph, BackendGetStringVariableNode, BackendGetStringVariableNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSetStringVariableNode, BackendSetStringVariableNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMarkdownNode, BackendMarkdownNode.metadata);

  // Register Event nodes
  registerNodeWithMetadata(LiteGraph, BackendOnMessageNode, BackendOnMessageNode.metadata);

  // Register Codebolt nodes
  registerNodeWithMetadata(LiteGraph, BackendSendMessageNode, BackendSendMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendReadFileNode, BackendReadFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendWriteToFileNode, BackendWriteToFileNode.metadata);

  // Register additional File System nodes
  registerNodeWithMetadata(LiteGraph, BackendCreateFileNode, BackendCreateFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendListFileNode, BackendListFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCreateFolderNode, BackendCreateFolderNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendUpdateFileNode, BackendUpdateFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendDeleteFileNode, BackendDeleteFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendDeleteFolderNode, BackendDeleteFolderNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSearchFilesNode, BackendSearchFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGrepSearchNode, BackendGrepSearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendFileSearchNode, BackendFileSearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendEditFileWithDiffNode, BackendEditFileWithDiffNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendReadManyFilesNode, BackendReadManyFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendListDirectoryNode, BackendListDirectoryNode.metadata);

  registerNodeWithMetadata(LiteGraph, BackendGetChatHistoryNode, BackendGetChatHistoryNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendWaitForReplyNode, BackendWaitForReplyNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendProcessStartedNode, BackendProcessStartedNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendStopProcessNode, BackendStopProcessNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendProcessFinishedNode, BackendProcessFinishedNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSendConfirmationRequestNode, BackendSendConfirmationRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAskQuestionNode, BackendAskQuestionNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSendNotificationEventNode, BackendSendNotificationEventNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitInitNode, BackendGitInitNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitPullNode, BackendGitPullNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitPushNode, BackendGitPushNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitStatusNode, BackendGitStatusNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitAddNode, BackendGitAddNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitCommitNode, BackendGitCommitNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitCheckoutNode, BackendGitCheckoutNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitBranchNode, BackendGitBranchNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitLogsNode, BackendGitLogsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGitDiffNode, BackendGitDiffNode.metadata);

  // Register Terminal nodes
  registerNodeWithMetadata(LiteGraph, BackendExecuteCommandNode, BackendExecuteCommandNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendExecuteCommandRunUntilErrorNode, BackendExecuteCommandRunUntilErrorNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSendManualInterruptNode, BackendSendManualInterruptNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendExecuteCommandWithStreamNode, BackendExecuteCommandWithStreamNode.metadata);

  registerNodeWithMetadata(LiteGraph, BackendFindAgentNode, BackendFindAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendStartAgentNode, BackendStartAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendListAgentsNode, BackendListAgentsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAgentsDetailNode, BackendAgentsDetailNode.metadata);

  // Register ActionPlan nodes
  registerNodeWithMetadata(LiteGraph, BackendGetAllPlansNode, BackendGetAllPlansNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetPlanDetailNode, BackendGetPlanDetailNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetActionPlanDetailNode, BackendGetActionPlanDetailNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCreateActionPlanNode, BackendCreateActionPlanNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendUpdateActionPlanNode, BackendUpdateActionPlanNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAddTaskToActionPlanNode, BackendAddTaskToActionPlanNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendStartTaskStepNode, BackendStartTaskStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendStartTaskStepWithListenerNode, BackendStartTaskStepWithListenerNode.metadata);

  registerNodeWithMetadata(LiteGraph, BackendCrawlerStartNode, BackendCrawlerStartNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCrawlerScreenshotNode, BackendCrawlerScreenshotNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCrawlerGoToPageNode, BackendCrawlerGoToPageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCrawlerScrollNode, BackendCrawlerScrollNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCrawlerClickNode, BackendCrawlerClickNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryAddNode, BackendMemoryAddNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryGetNode, BackendMemoryGetNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryJsonSaveNode, BackendMemoryJsonSaveNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryJsonUpdateNode, BackendMemoryJsonUpdateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryJsonDeleteNode, BackendMemoryJsonDeleteNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryJsonListNode, BackendMemoryJsonListNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryTodoSaveNode, BackendMemoryTodoSaveNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryTodoUpdateNode, BackendMemoryTodoUpdateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryTodoDeleteNode, BackendMemoryTodoDeleteNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryTodoListNode, BackendMemoryTodoListNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryMarkdownSaveNode, BackendMemoryMarkdownSaveNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryMarkdownUpdateNode, BackendMemoryMarkdownUpdateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryMarkdownDeleteNode, BackendMemoryMarkdownDeleteNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMemoryMarkdownListNode, BackendMemoryMarkdownListNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSummarizeAllNode, BackendSummarizeAllNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSummarizePartNode, BackendSummarizePartNode.metadata);

  // Register LLM nodes
  registerNodeWithMetadata(LiteGraph, BackendInferenceNode, BackendInferenceNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetModelConfigNode, BackendGetModelConfigNode.metadata);

  registerNodeWithMetadata(LiteGraph, BackendMCPGetEnabledNode, BackendMCPGetEnabledNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPLocalServersNode, BackendMCPLocalServersNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPMentionedServersNode, BackendMCPMentionedServersNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPSearchServersNode, BackendMCPSearchServersNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPListToolsNode, BackendMCPListToolsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPConfigureNode, BackendMCPConfigureNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPGetToolsNode, BackendMCPGetToolsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPExecuteToolNode, BackendMCPExecuteToolNode.metadata);

  // Register Search nodes
  registerNodeWithMetadata(LiteGraph, BackendSearchNode, BackendSearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetFirstLinkNode, BackendGetFirstLinkNode.metadata);

  // Register Debug nodes
  registerNodeWithMetadata(LiteGraph, BackendDebugNode, BackendDebugNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendOpenDebugBrowserNode, BackendOpenDebugBrowserNode.metadata);

  // Register Task Management nodes
  registerNodeWithMetadata(LiteGraph, BackendCreateTaskNode, BackendCreateTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTaskListNode, BackendGetTaskListNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendStartTaskNode, BackendStartTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCompleteTaskNode, BackendCompleteTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendDeleteTaskNode, BackendDeleteTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendUpdateTaskNode, BackendUpdateTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTaskDetailNode, BackendGetTaskDetailNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAddStepToTaskNode, BackendAddStepToTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTaskMessagesNode, BackendGetTaskMessagesNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetAllStepsNode, BackendGetAllStepsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetCurrentRunningStepNode, BackendGetCurrentRunningStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendUpdateStepStatusNode, BackendUpdateStepStatusNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCompleteStepNode, BackendCompleteStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSendSteeringMessageNode, BackendSendSteeringMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCanTaskStartNode, BackendCanTaskStartNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTasksDependentOnNode, BackendGetTasksDependentOnNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTasksReadyToStartNode, BackendGetTasksReadyToStartNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTaskDependencyChainNode, BackendGetTaskDependencyChainNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTaskStatsNode, BackendGetTaskStatsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTasksStartedByMeNode, BackendGetTasksStartedByMeNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAttachMemoryToTaskNode, BackendAttachMemoryToTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetAttachedMemoryForTaskNode, BackendGetAttachedMemoryForTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCreateTaskGroupNode, BackendCreateTaskGroupNode.metadata);

  // Register State nodes
  registerNodeWithMetadata(LiteGraph, BackendGetApplicationStateNode, BackendGetApplicationStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAddToAgentStateNode, BackendAddToAgentStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetAgentStateNode, BackendGetAgentStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetProjectStateNode, BackendGetProjectStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendUpdateProjectStateNode, BackendUpdateProjectStateNode.metadata);

  // Register User Message Manager nodes
  registerNodeWithMetadata(LiteGraph, BackendGetCurrentUserMessageNode, BackendGetCurrentUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetUserMessageTextNode, BackendGetUserMessageTextNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendHasCurrentUserMessageNode, BackendHasCurrentUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendClearUserMessageNode, BackendClearUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetMentionedFilesNode, BackendGetMentionedFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetMentionedMCPsNode, BackendGetMentionedMCPsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetCurrentFileNode, BackendGetCurrentFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetSelectionNode, BackendGetSelectionNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetRemixPromptNode, BackendGetRemixPromptNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetUploadedImagesNode, BackendGetUploadedImagesNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSetUserSessionDataNode, BackendSetUserSessionDataNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetUserSessionDataNode, BackendGetUserSessionDataNode.metadata);

  // Register VectorDB nodes
  registerNodeWithMetadata(LiteGraph, BackendGetVectorNode, BackendGetVectorNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAddVectorItemNode, BackendAddVectorItemNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendQueryVectorItemNode, BackendQueryVectorItemNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendQueryVectorItemsNode, BackendQueryVectorItemsNode.metadata);

  // Register Utils nodes
  registerNodeWithMetadata(LiteGraph, BackendEditFileAndApplyDiffNode, BackendEditFileAndApplyDiffNode.metadata);

  // Register Tokenizer nodes
  registerNodeWithMetadata(LiteGraph, BackendAddTokenNode, BackendAddTokenNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetTokenNode, BackendGetTokenNode.metadata);

  // Register Output parser nodes
  registerNodeWithMetadata(LiteGraph, BackendParseJSONNode, BackendParseJSONNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendParseXMLNode, BackendParseXMLNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendParseCSVNode, BackendParseCSVNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendParseTextNode, BackendParseTextNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendParseErrorsNode, BackendParseErrorsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendParseWarningsNode, BackendParseWarningsNode.metadata);

  // Register Codeutils nodes
  registerNodeWithMetadata(LiteGraph, BackendGetAllFilesAsMarkDownNode, BackendGetAllFilesAsMarkDownNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendPerformMatchNode, BackendPerformMatchNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetMatcherListNode, BackendGetMatcherListNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMatchDetailNode, BackendMatchDetailNode.metadata);

  // Register RAG nodes
  registerNodeWithMetadata(LiteGraph, BackendAddFileNode, BackendAddFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendRetrieveRelatedKnowledgeNode, BackendRetrieveRelatedKnowledgeNode.metadata);

  // AI Agent nodes are now handled by the Unified Agent nodes export

  // Register Unified Agent nodes
  registerNodeWithMetadata(LiteGraph, BackendAgentUnifiedNode, BackendAgentUnifiedNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAgentStepNode, BackendAgentStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendInitialPromptGeneratorNode, BackendInitialPromptGeneratorNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendResponseExecutorNode, BackendResponseExecutorNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendToolNode, BackendToolNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendWorkflowNode, BackendWorkflowNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMessageProcessorNode, BackendMessageProcessorNode.metadata);

  // Register Notification nodes
  // Browser Notification nodes
  registerNodeWithMetadata(LiteGraph, BackendWebFetchRequestNode, BackendWebFetchRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendWebFetchResponseNode, BackendWebFetchResponseNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendWebSearchRequestNode, BackendWebSearchRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendWebSearchResponseNode, BackendWebSearchResponseNode.metadata);

  // LLM Notification nodes
  registerNodeWithMetadata(LiteGraph, BackendLLMInferenceRequestNode, BackendLLMInferenceRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendLLMInferenceResponseNode, BackendLLMInferenceResponseNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendLLMGetTokenCountNode, BackendLLMGetTokenCountNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendLLMSendTokenCountResponseNode, BackendLLMSendTokenCountResponseNode.metadata);

  // MCP Notification nodes
  registerNodeWithMetadata(LiteGraph, BackendGetEnabledMCPServersRequestNode, BackendGetEnabledMCPServersRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetEnabledMCPServersResultNode, BackendGetEnabledMCPServersResultNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendListToolsFromMCPServersRequestNode, BackendListToolsFromMCPServersRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendListToolsFromMCPServersResultNode, BackendListToolsFromMCPServersResultNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetToolsRequestNode, BackendGetToolsRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetToolsResultNode, BackendGetToolsResultNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendExecuteToolRequestNode, BackendExecuteToolRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendExecuteToolResultNode, BackendExecuteToolResultNode.metadata);

  // Crawler Notification nodes
  registerNodeWithMetadata(LiteGraph, BackendCrawlerSearchRequestNode, BackendCrawlerSearchRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCrawlerSearchResponseNode, BackendCrawlerSearchResponseNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCrawlerStartRequestNode, BackendCrawlerStartRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCrawlerStartResponseNode, BackendCrawlerStartResponseNode.metadata);
}