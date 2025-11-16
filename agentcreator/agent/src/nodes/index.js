// Backend execution nodes
export { ConstNode } from './ConstNode.js';
export { SumNode } from './SumNode.js';

// Base nodes
export { TimeNode } from './TimeNode.js';
export { ConstantNumberNode } from './ConstantNumberNode.js';

// Math nodes
export {
  BypassNode,
  ToNumberNode,
  RandNode,
  AbsNode,
  ClampNode
} from './MathNodes.js';

// Logic nodes
export {
  OrNode,
  NotNode,
  SelectorNode
} from './LogicNodes.js';

// String nodes
export {
  ToStringNode,
  CompareNode,
  ToUpperCaseNode,
  ContainsNode
} from './StringNodes.js';

// Variable nodes
export {
  GetStringVariableNode,
  SetStringVariableNode
} from './Variables/index.js';

// Widget nodes
export { MarkdownNode } from './MarkdownNode.js';

// Codebolt nodes
export * from './BaseCodeboltApis/index.js';
export * from './BaseCodeboltNotifications/index.js';

// AI Agent nodes
export { UserMessageNode } from './UserMessageNode.js';
export { SystemPromptNode } from './SystemPromptNode.js';
export { MCPToolsNode } from './MCPToolsNode.js';
export { TaskInstructionNode } from './TaskInstructionNode.js';
export { AgentNode } from './AgentNode.js';
export { AgentRunNode } from './AgentRunNode.js';

// Backend node registration utility
import { LiteGraph } from '@codebolt/litegraph';
import { registerNodeWithMetadata } from '@agent-creator/shared-nodes';
import { ConstNode as BackendConstNode } from './ConstNode.js';
import { SumNode as BackendSumNode } from './SumNode.js';
import { TimeNode as BackendTimeNode } from './TimeNode.js';
import { ConstantNumberNode as BackendConstantNumberNode } from './ConstantNumberNode.js';
import {
  BypassNode as BackendBypassNode,
  ToNumberNode as BackendToNumberNode,
  RandNode as BackendRandNode,
  AbsNode as BackendAbsNode,
  ClampNode as BackendClampNode
} from './MathNodes.js';
import {
  OrNode as BackendOrNode,
  NotNode as BackendNotNode,
  SelectorNode as BackendSelectorNode
} from './LogicNodes.js';
import {
  ToStringNode as BackendToStringNode,
  CompareNode as BackendCompareNode,
  ToUpperCaseNode as BackendToUpperCaseNode,
  ContainsNode as BackendContainsNode
} from './StringNodes.js';
import {
  GetStringVariableNode as BackendGetStringVariableNode,
  SetStringVariableNode as BackendSetStringVariableNode
} from './Variables/index.js';
import { MarkdownNode as BackendMarkdownNode } from './MarkdownNode.js';
import { UserMessageNode as BackendUserMessageNode } from './UserMessageNode.js';
import { SystemPromptNode as BackendSystemPromptNode } from './SystemPromptNode.js';
import { MCPToolsNode as BackendMCPToolsNode } from './MCPToolsNode.js';
import { TaskInstructionNode as BackendTaskInstructionNode } from './TaskInstructionNode.js';
import { AgentNode as BackendAgentNode } from './AgentNode.js';
import { AgentRunNode as BackendAgentRunNode } from './AgentRunNode.js';
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

export function registerBackendNodes() {
  // Register backend execution nodes
  registerNodeWithMetadata(LiteGraph, BackendConstNode, BackendConstNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSumNode, BackendSumNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendTimeNode, BackendTimeNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendConstantNumberNode, BackendConstantNumberNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendBypassNode, BackendBypassNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendToNumberNode, BackendToNumberNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendRandNode, BackendRandNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAbsNode, BackendAbsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendClampNode, BackendClampNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendOrNode, BackendOrNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendNotNode, BackendNotNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSelectorNode, BackendSelectorNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendToStringNode, BackendToStringNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendCompareNode, BackendCompareNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendToUpperCaseNode, BackendToUpperCaseNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendContainsNode, BackendContainsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendGetStringVariableNode, BackendGetStringVariableNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSetStringVariableNode, BackendSetStringVariableNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMarkdownNode, BackendMarkdownNode.metadata);

  // Register Event nodes
  registerNodeWithMetadata(LiteGraph, BackendOnMessageNode, BackendOnMessageNode.metadata);

  // Register Codebolt nodes
  registerNodeWithMetadata(LiteGraph, BackendSendMessageNode, BackendSendMessageNode.metadata);
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
  registerNodeWithMetadata(LiteGraph, BackendFindAgentNode, BackendFindAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendStartAgentNode, BackendStartAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendListAgentsNode, BackendListAgentsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAgentsDetailNode, BackendAgentsDetailNode.metadata);
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

  // Register RAG nodes
  registerNodeWithMetadata(LiteGraph, BackendAddFileNode, BackendAddFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendRetrieveRelatedKnowledgeNode, BackendRetrieveRelatedKnowledgeNode.metadata);

  // Register AI Agent nodes
  registerNodeWithMetadata(LiteGraph, BackendUserMessageNode, BackendUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSystemPromptNode, BackendSystemPromptNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPToolsNode, BackendMCPToolsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendTaskInstructionNode, BackendTaskInstructionNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAgentNode, BackendAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAgentRunNode, BackendAgentRunNode.metadata);
}