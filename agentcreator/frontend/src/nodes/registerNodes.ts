import { LiteGraph } from '@codebolt/litegraph';

// UI-specific nodes (refactored)
import {
  SumNode,
  BypassNode, ToNumberNode, RandNode, AbsNode, ClampNode,
  ToStringNode, CompareNode, ToUpperCaseNode, ContainsNode,
  MarkdownNode,
  // AI Agent nodes
  // UserMessageNode, SystemPromptNode, MCPToolsNode,
  // TaskInstructionNode, AgentNode, AgentRunNode
} from './ui/index';

// Commenting out problematic imports temporarily to test TypeScript fixes
// import WidgetKnobNode from './interface/WidgetKnobNode.jsx';
// import WidgetHSliderNode from './interface/WidgetHSliderNode.jsx';
// import WidgetProgressNode from './interface/WidgetProgressNode.jsx';
// import WidgetTextNode from './interface/WidgetTextNode.jsx';
// import WidgetPanelNode from './interface/WidgetPanelNode.jsx';


// Event and Codebolt nodes
import { OnMessageNode, SendMessageNode,
  GetChatHistoryNode, WaitForReplyNode, ProcessStartedNode,
  StopProcessNode, ProcessFinishedNode, SendConfirmationRequestNode,
  AskQuestionNode, SendNotificationEventNode,
  CreateFileNode, CreateFolderNode, ReadFileNode, UpdateFileNode,
  DeleteFileNode, DeleteFolderNode, ListFileNode, SearchFilesNode,
  WriteToFileNode, GrepSearchNode, FileSearchNode, EditFileWithDiffNode,
  ReadManyFilesNode, ListDirectoryNode,
  GitInitNode, GitPullNode, GitPushNode, GitStatusNode, GitAddNode,
  GitCommitNode, GitCheckoutNode, GitBranchNode, GitLogsNode, GitDiffNode,
  FindAgentNode, StartAgentNode, ListAgentsNode, AgentsDetailNode,
  CrawlerStartNode, CrawlerScreenshotNode, CrawlerGoToPageNode,
  CrawlerScrollNode, CrawlerClickNode,
  MemoryAddNode, MemoryGetNode,
  MemoryJsonSaveNode, MemoryJsonUpdateNode, MemoryJsonDeleteNode, MemoryJsonListNode,
  MemoryTodoSaveNode, MemoryTodoUpdateNode, MemoryTodoDeleteNode, MemoryTodoListNode,
  MemoryMarkdownSaveNode, MemoryMarkdownUpdateNode, MemoryMarkdownDeleteNode, MemoryMarkdownListNode,
  SummarizeAllNode, SummarizePartNode,
  MCPGetEnabledNode, MCPLocalServersNode, MCPMentionedServersNode,
  MCPSearchServersNode, MCPListToolsNode, MCPConfigureNode,
  MCPGetToolsNode, MCPExecuteToolNode,
  SearchNode, GetFirstLinkNode,
  // RAG nodes
  AddFileNode, RetrieveRelatedKnowledgeNode,
  // Task Management nodes
  CreateTaskNode, GetTaskListNode, StartTaskNode, CompleteTaskNode, DeleteTaskNode,
  UpdateTaskNode, GetTaskDetailNode, AddStepToTaskNode, GetTaskMessagesNode,
  GetAllStepsNode, GetCurrentRunningStepNode, UpdateStepStatusNode, CompleteStepNode,
  SendSteeringMessageNode, CanTaskStartNode, GetTasksDependentOnNode, GetTasksReadyToStartNode,
  GetTaskDependencyChainNode, GetTaskStatsNode, GetTasksStartedByMeNode, AttachMemoryToTaskNode,
  GetAttachedMemoryForTaskNode, CreateTaskGroupNode,
  // User Message Manager nodes
  GetCurrentUserMessageNode, GetUserMessageTextNode, HasCurrentUserMessageNode, ClearUserMessageNode,
  GetMentionedFilesNode, GetMentionedMCPsNode, GetCurrentFileNode, GetSelectionNode, GetRemixPromptNode,
  GetUploadedImagesNode, SetUserSessionDataNode, GetUserSessionDataNode,
  // VectorDB nodes
  GetVectorNode, AddVectorItemNode, QueryVectorItemNode, QueryVectorItemsNode,
  // Utils nodes
  EditFileAndApplyDiffNode,
  // Output Parser nodes
  ParseCSVNode, ParseJSONNode, ParseXMLNode, ParseTextNode, ParseErrorsNode, ParseWarningsNode,
  // Action Plan nodes
  GetAllPlansNode, GetPlanDetailNode, GetActionPlanDetailNode, CreateActionPlanNode, UpdateActionPlanNode, AddTaskToActionPlanNode, StartTaskStepNode, StartTaskStepWithListenerNode,
  // Terminal nodes
  ExecuteCommandNode, ExecuteCommandRunUntilErrorNode, SendManualInterruptNode, ExecuteCommandWithStreamNode,
  // Code Utils nodes
  GetAllFilesAsMarkDownNode, PerformMatchNode, GetMatcherListNode, MatchDetailNode,
  // Debug nodes
  DebugNode, OpenDebugBrowserNode,
  // State nodes
  GetApplicationStateNode, AddToAgentStateNode, GetAgentStateNode, GetProjectStateNode, UpdateProjectStateNode,
  // Tokenizer nodes
  AddTokenNode, GetTokenNode,

  // Inference nodes
  InferenceNode, GetModelConfigNode
} from './BaseCodeboltApis/index';

// Browser Notification nodes
import {
  WebFetchRequestNode,
  WebFetchResponseNode,
  WebSearchRequestNode,
  WebSearchResponseNode
} from './BaseCodeboltNotifications/index';

// LLM Notification nodes
import {
  LLMInferenceRequestNode,
  LLMInferenceResponseNode,
  LLMGetTokenCountNode,
  LLMSendTokenCountResponseNode
} from './BaseCodeboltNotifications/index';

// MCP Notification nodes
import {
  GetEnabledMCPServersRequestNode,
  GetEnabledMCPServersResultNode,
  ListToolsFromMCPServersRequestNode,
  ListToolsFromMCPServersResultNode,
  GetToolsRequestNode,
  GetToolsResultNode,
  ExecuteToolRequestNode,
  ExecuteToolResultNode
} from './BaseCodeboltNotifications/index';

// Crawler Notification nodes
import {
  CrawlerSearchRequestNode,
  CrawlerSearchResponseNode,
  CrawlerStartRequestNode,
  CrawlerStartResponseNode
} from './BaseCodeboltNotifications/index';

// Unified Agent nodes
import {
  AgentNode as UnifiedAgentNode,
  AgentStepNode,
  InitialPromptGeneratorNode,
  ResponseExecutorNode,
  ToolNode,
  WorkflowNode,
  MessageProcessorNode
} from './CodeboltAgentUnifiedMode/index';

// Constants nodes
import {
  ConstNode,
  ConstantNumberNode,
  ConstantStringNode,
  ConstantBooleanNode,
  ConstantObjectNode
} from './Constants/index';

// Utility nodes
import {
  TimeNode,
  RandomNode,
  DelayNode,
  LoggerNode
} from './Utility/index';

import { registerNodeWithMetadata } from '@agent-creator/shared-nodes';

// Base nodes (legacy - to be refactored)
import JSONParseNode from './base/JSONParseNode';
import SubgraphNode from './base/SubgraphNode';
import GraphInputNode from './base/GraphInputNode';
import GraphOutputNode from './base/GraphOutputNode';

// Math nodes (legacy - not refactored yet)
import ConverterNode from './Math/ConverterNode';
import RangeNode from './Math/RangeNode';
import LerpNode from './Math/LerpNode';
import FloorNode from './Math/FloorNode';
import FracNode from './Math/FracNode';
import SmoothStepNode from './Math/SmoothStepNode';
import ScaleNode from './Math/ScaleNode';
import GateNode from './Math/GateNode';
import OperationNode from './Math/OperationNode';

// Logic nodes (legacy - not refactored yet)
import { SequenceNode } from './Logical/SequenceNode';
import { AndNode } from './Logical/AndNode';
import { BranchNode } from './Logical/BranchNode';

// String nodes (legacy - not refactored yet)
// import ConcatenateNode from './strings/ConcatenateNode'; // Files don't exist - commented out
// import SplitNode from './strings/SplitNode';
// import ToFixedNode from './strings/ToFixedNode'; // File doesn't exist - commented out
// import StringToTableNode from './strings/StringToTableNode';

// Interface nodes - commented out temporarily
// import WidgetKnobNode from './interface/WidgetKnobNode.jsx';
// import WidgetHSliderNode from './interface/WidgetHSliderNode.jsx';
// import WidgetProgressNode from './interface/WidgetProgressNode.jsx';
// import WidgetTextNode from './interface/WidgetTextNode.jsx';
// import WidgetPanelNode from './interface/WidgetPanelNode.jsx';

import {
  GetStringVariableNode,
  SetStringVariableNode
} from './Variables/index.ts';

// Export nodes for direct use
export {
  // UI-specific nodes (refactored)
  ConstNode, SumNode, TimeNode, ConstantNumberNode,
  BypassNode, ToNumberNode, RandNode, AbsNode, ClampNode,
  ToStringNode, CompareNode,
  ToUpperCaseNode, ContainsNode, MarkdownNode,
  // AI Agent nodes
  // UserMessageNode, SystemPromptNode, MCPToolsNode,
  // TaskInstructionNode, AgentNode, AgentRunNode,
  GetStringVariableNode, SetStringVariableNode,
  // Event and Codebolt nodes
  OnMessageNode, SendMessageNode, GetChatHistoryNode, WaitForReplyNode,
  ProcessStartedNode, StopProcessNode, ProcessFinishedNode,
  SendConfirmationRequestNode, AskQuestionNode, SendNotificationEventNode,
  // File System nodes
  CreateFileNode, CreateFolderNode, ReadFileNode, UpdateFileNode,
  DeleteFileNode, DeleteFolderNode, ListFileNode, SearchFilesNode,
  WriteToFileNode, GrepSearchNode, FileSearchNode, EditFileWithDiffNode,
  ReadManyFilesNode, ListDirectoryNode,
  // Git nodes
  GitInitNode, GitPullNode, GitPushNode, GitStatusNode, GitAddNode,
  GitCommitNode, GitCheckoutNode, GitBranchNode, GitLogsNode, GitDiffNode,
  // Agent service nodes
  FindAgentNode, StartAgentNode, ListAgentsNode, AgentsDetailNode,
  // Crawler nodes
  CrawlerStartNode, CrawlerScreenshotNode, CrawlerGoToPageNode,
  CrawlerScrollNode, CrawlerClickNode,
  // Memory nodes
  MemoryAddNode, MemoryGetNode,
  MemoryJsonSaveNode, MemoryJsonUpdateNode, MemoryJsonDeleteNode, MemoryJsonListNode,
  MemoryTodoSaveNode, MemoryTodoUpdateNode, MemoryTodoDeleteNode, MemoryTodoListNode,
  MemoryMarkdownSaveNode, MemoryMarkdownUpdateNode, MemoryMarkdownDeleteNode, MemoryMarkdownListNode,
  // History nodes
  SummarizeAllNode, SummarizePartNode,
  // MCP nodes
  MCPGetEnabledNode, MCPLocalServersNode, MCPMentionedServersNode,
  MCPSearchServersNode, MCPListToolsNode, MCPConfigureNode,
  MCPGetToolsNode, MCPExecuteToolNode,
  // Search nodes
  SearchNode, GetFirstLinkNode,
  // Task Management nodes
  CreateTaskNode, GetTaskListNode, StartTaskNode, CompleteTaskNode, DeleteTaskNode,
  UpdateTaskNode, GetTaskDetailNode, AddStepToTaskNode, GetTaskMessagesNode,
  GetAllStepsNode, GetCurrentRunningStepNode, UpdateStepStatusNode, CompleteStepNode,
  SendSteeringMessageNode, CanTaskStartNode, GetTasksDependentOnNode, GetTasksReadyToStartNode,
  GetTaskDependencyChainNode, GetTaskStatsNode, GetTasksStartedByMeNode, AttachMemoryToTaskNode,
  GetAttachedMemoryForTaskNode, CreateTaskGroupNode,
  // User Message Manager nodes
  GetCurrentUserMessageNode, GetUserMessageTextNode, HasCurrentUserMessageNode, ClearUserMessageNode,
  GetMentionedFilesNode, GetMentionedMCPsNode, GetCurrentFileNode, GetSelectionNode, GetRemixPromptNode,
  GetUploadedImagesNode, SetUserSessionDataNode, GetUserSessionDataNode,
  // VectorDB nodes
  GetVectorNode, AddVectorItemNode, QueryVectorItemNode, QueryVectorItemsNode,
  // Utils nodes
  EditFileAndApplyDiffNode,
  // Output Parser nodes
  ParseCSVNode, ParseJSONNode, ParseXMLNode, ParseTextNode, ParseErrorsNode, ParseWarningsNode,
  // Action Plan nodes
  GetAllPlansNode, GetPlanDetailNode, GetActionPlanDetailNode, CreateActionPlanNode, UpdateActionPlanNode, AddTaskToActionPlanNode, StartTaskStepNode, StartTaskStepWithListenerNode,
  // Terminal nodes
  ExecuteCommandNode, ExecuteCommandRunUntilErrorNode, SendManualInterruptNode, ExecuteCommandWithStreamNode,
  // Code Utils nodes
  GetAllFilesAsMarkDownNode, PerformMatchNode, GetMatcherListNode, MatchDetailNode,
  // Debug nodes
  DebugNode, OpenDebugBrowserNode,
  // State nodes
  GetApplicationStateNode, AddToAgentStateNode, GetAgentStateNode, GetProjectStateNode, UpdateProjectStateNode,
  // Tokenizer nodes
  AddTokenNode, GetTokenNode,
  // Browser Notification nodes
  WebFetchRequestNode, WebFetchResponseNode, WebSearchRequestNode, WebSearchResponseNode,
  // LLM Notification nodes
  LLMInferenceRequestNode, LLMInferenceResponseNode, LLMGetTokenCountNode, LLMSendTokenCountResponseNode,
  // Crawler Notification nodes
  CrawlerSearchRequestNode, CrawlerSearchResponseNode, CrawlerStartRequestNode, CrawlerStartResponseNode,
  // MCP Notification nodes
  GetEnabledMCPServersRequestNode, GetEnabledMCPServersResultNode,
  ListToolsFromMCPServersRequestNode, ListToolsFromMCPServersResultNode,
  GetToolsRequestNode, GetToolsResultNode, ExecuteToolRequestNode, ExecuteToolResultNode,
  // Unified Agent nodes
   AgentStepNode, InitialPromptGeneratorNode, ResponseExecutorNode,
  ToolNode, WorkflowNode, MessageProcessorNode,
  // Constants nodes
  ConstantStringNode, ConstantBooleanNode, ConstantObjectNode,
  // Utility nodes
  RandomNode, DelayNode, LoggerNode,
  // Legacy nodes
  JSONParseNode,
  SubgraphNode, GraphInputNode, GraphOutputNode, ConverterNode, RangeNode,
  LerpNode, FloorNode, FracNode, SmoothStepNode, ScaleNode, GateNode,
  OperationNode, SequenceNode, AndNode, BranchNode, /* ConcatenateNode, */
  /* SplitNode, ToFixedNode, StringToTableNode, */ /* WidgetKnobNode, WidgetHSliderNode,
  WidgetProgressNode, WidgetTextNode, WidgetPanelNode */
  // Inference nodes
  InferenceNode, GetModelConfigNode
};

// Register all node types
export const registerNodes = () => {
  // Register refactored nodes using their .metadata property
  registerNodeWithMetadata(LiteGraph, ConstNode, ConstNode.metadata);
  registerNodeWithMetadata(LiteGraph, SumNode, SumNode.metadata);
  registerNodeWithMetadata(LiteGraph, TimeNode, TimeNode.metadata);
  registerNodeWithMetadata(LiteGraph, ConstantNumberNode, ConstantNumberNode.metadata);

  // Utility nodes
  registerNodeWithMetadata(LiteGraph, RandomNode, RandomNode.metadata);
  registerNodeWithMetadata(LiteGraph, DelayNode, DelayNode.metadata);
  registerNodeWithMetadata(LiteGraph, LoggerNode, LoggerNode.metadata);

  // Constants nodes
  registerNodeWithMetadata(LiteGraph, ConstantStringNode, ConstantStringNode.metadata);
  registerNodeWithMetadata(LiteGraph, ConstantBooleanNode, ConstantBooleanNode.metadata);
  registerNodeWithMetadata(LiteGraph, ConstantObjectNode, ConstantObjectNode.metadata);

  // Math nodes
  registerNodeWithMetadata(LiteGraph, BypassNode, BypassNode.metadata);
  registerNodeWithMetadata(LiteGraph, ToNumberNode, ToNumberNode.metadata);
  registerNodeWithMetadata(LiteGraph, RandNode, RandNode.metadata);
  registerNodeWithMetadata(LiteGraph, AbsNode, AbsNode.metadata);
  registerNodeWithMetadata(LiteGraph, ClampNode, ClampNode.metadata);

  // Logic nodes
  // registerNodeWithMetadata(LiteGraph, OrNode, OrNode.metadata);
  // registerNodeWithMetadata(LiteGraph, NotNode, NotNode.metadata);
  // registerNodeWithMetadata(LiteGraph, SelectorNode, SelectorNode.metadata);

  // String nodes
  registerNodeWithMetadata(LiteGraph, ToStringNode, ToStringNode.metadata);
  registerNodeWithMetadata(LiteGraph, CompareNode, CompareNode.metadata);
  registerNodeWithMetadata(LiteGraph, ToUpperCaseNode, ToUpperCaseNode.metadata);
  registerNodeWithMetadata(LiteGraph, ContainsNode, ContainsNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetStringVariableNode, GetStringVariableNode.metadata);
  registerNodeWithMetadata(LiteGraph, SetStringVariableNode, SetStringVariableNode.metadata);

  // Widget nodes
  registerNodeWithMetadata(LiteGraph, MarkdownNode, MarkdownNode.metadata);

  //
  // Codebolt nodes
  //
  // Event nodes
  registerNodeWithMetadata(LiteGraph, OnMessageNode, OnMessageNode.metadata);

  // Chat nodes
  registerNodeWithMetadata(LiteGraph, SendMessageNode, SendMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetChatHistoryNode, GetChatHistoryNode.metadata);
  registerNodeWithMetadata(LiteGraph, WaitForReplyNode, WaitForReplyNode.metadata);
  registerNodeWithMetadata(LiteGraph, ProcessStartedNode, ProcessStartedNode.metadata);
  registerNodeWithMetadata(LiteGraph, StopProcessNode, StopProcessNode.metadata);
  registerNodeWithMetadata(LiteGraph, ProcessFinishedNode, ProcessFinishedNode.metadata);
  registerNodeWithMetadata(LiteGraph, SendConfirmationRequestNode, SendConfirmationRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, AskQuestionNode, AskQuestionNode.metadata);
  registerNodeWithMetadata(LiteGraph, SendNotificationEventNode, SendNotificationEventNode.metadata);

  // File System nodes
  registerNodeWithMetadata(LiteGraph, CreateFileNode, CreateFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, CreateFolderNode, CreateFolderNode.metadata);
  registerNodeWithMetadata(LiteGraph, ReadFileNode, ReadFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, UpdateFileNode, UpdateFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, DeleteFileNode, DeleteFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, DeleteFolderNode, DeleteFolderNode.metadata);
  registerNodeWithMetadata(LiteGraph, ListFileNode, ListFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, SearchFilesNode, SearchFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, WriteToFileNode, WriteToFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, GrepSearchNode, GrepSearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, FileSearchNode, FileSearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, EditFileWithDiffNode, EditFileWithDiffNode.metadata);
  registerNodeWithMetadata(LiteGraph, ReadManyFilesNode, ReadManyFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, ListDirectoryNode, ListDirectoryNode.metadata);

  // Git nodes
  registerNodeWithMetadata(LiteGraph, GitInitNode, GitInitNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitPullNode, GitPullNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitPushNode, GitPushNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitStatusNode, GitStatusNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitAddNode, GitAddNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitCommitNode, GitCommitNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitCheckoutNode, GitCheckoutNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitBranchNode, GitBranchNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitLogsNode, GitLogsNode.metadata);
  registerNodeWithMetadata(LiteGraph, GitDiffNode, GitDiffNode.metadata);

  // Agent service nodes
  registerNodeWithMetadata(LiteGraph, FindAgentNode, FindAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, StartAgentNode, StartAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, ListAgentsNode, ListAgentsNode.metadata);
  registerNodeWithMetadata(LiteGraph, AgentsDetailNode, AgentsDetailNode.metadata);

  // Crawler nodes
  registerNodeWithMetadata(LiteGraph, CrawlerStartNode, CrawlerStartNode.metadata);
  registerNodeWithMetadata(LiteGraph, CrawlerScreenshotNode, CrawlerScreenshotNode.metadata);
  registerNodeWithMetadata(LiteGraph, CrawlerGoToPageNode, CrawlerGoToPageNode.metadata);
  registerNodeWithMetadata(LiteGraph, CrawlerScrollNode, CrawlerScrollNode.metadata);
  registerNodeWithMetadata(LiteGraph, CrawlerClickNode, CrawlerClickNode.metadata);

  // Crawler Notification nodes
  registerNodeWithMetadata(LiteGraph, CrawlerSearchRequestNode, CrawlerSearchRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, CrawlerSearchResponseNode, CrawlerSearchResponseNode.metadata);
  registerNodeWithMetadata(LiteGraph, CrawlerStartRequestNode, CrawlerStartRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, CrawlerStartResponseNode, CrawlerStartResponseNode.metadata);

  registerNodeWithMetadata(LiteGraph, MemoryAddNode, MemoryAddNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryGetNode, MemoryGetNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryJsonSaveNode, MemoryJsonSaveNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryJsonUpdateNode, MemoryJsonUpdateNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryJsonDeleteNode, MemoryJsonDeleteNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryJsonListNode, MemoryJsonListNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryTodoSaveNode, MemoryTodoSaveNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryTodoUpdateNode, MemoryTodoUpdateNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryTodoDeleteNode, MemoryTodoDeleteNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryTodoListNode, MemoryTodoListNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryMarkdownSaveNode, MemoryMarkdownSaveNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryMarkdownUpdateNode, MemoryMarkdownUpdateNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryMarkdownDeleteNode, MemoryMarkdownDeleteNode.metadata);
  registerNodeWithMetadata(LiteGraph, MemoryMarkdownListNode, MemoryMarkdownListNode.metadata);
  registerNodeWithMetadata(LiteGraph, SummarizeAllNode, SummarizeAllNode.metadata);
  registerNodeWithMetadata(LiteGraph, SummarizePartNode, SummarizePartNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPGetEnabledNode, MCPGetEnabledNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPLocalServersNode, MCPLocalServersNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPMentionedServersNode, MCPMentionedServersNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPSearchServersNode, MCPSearchServersNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPListToolsNode, MCPListToolsNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPConfigureNode, MCPConfigureNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPGetToolsNode, MCPGetToolsNode.metadata);
  registerNodeWithMetadata(LiteGraph, MCPExecuteToolNode, MCPExecuteToolNode.metadata);

  // Search nodes
  registerNodeWithMetadata(LiteGraph, SearchNode, SearchNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetFirstLinkNode, GetFirstLinkNode.metadata);

  // RAG nodes
  registerNodeWithMetadata(LiteGraph, AddFileNode, AddFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, RetrieveRelatedKnowledgeNode, RetrieveRelatedKnowledgeNode.metadata);

  // Task Management nodes
  registerNodeWithMetadata(LiteGraph, CreateTaskNode, CreateTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTaskListNode, GetTaskListNode.metadata);
  registerNodeWithMetadata(LiteGraph, StartTaskNode, StartTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, CompleteTaskNode, CompleteTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, DeleteTaskNode, DeleteTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, UpdateTaskNode, UpdateTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTaskDetailNode, GetTaskDetailNode.metadata);
  registerNodeWithMetadata(LiteGraph, AddStepToTaskNode, AddStepToTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTaskMessagesNode, GetTaskMessagesNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetAllStepsNode, GetAllStepsNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetCurrentRunningStepNode, GetCurrentRunningStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, UpdateStepStatusNode, UpdateStepStatusNode.metadata);
  registerNodeWithMetadata(LiteGraph, CompleteStepNode, CompleteStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, SendSteeringMessageNode, SendSteeringMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, CanTaskStartNode, CanTaskStartNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTasksDependentOnNode, GetTasksDependentOnNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTasksReadyToStartNode, GetTasksReadyToStartNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTaskDependencyChainNode, GetTaskDependencyChainNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTaskStatsNode, GetTaskStatsNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTasksStartedByMeNode, GetTasksStartedByMeNode.metadata);
  registerNodeWithMetadata(LiteGraph, AttachMemoryToTaskNode, AttachMemoryToTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetAttachedMemoryForTaskNode, GetAttachedMemoryForTaskNode.metadata);
  registerNodeWithMetadata(LiteGraph, CreateTaskGroupNode, CreateTaskGroupNode.metadata);

  // User Message Manager nodes
  registerNodeWithMetadata(LiteGraph, GetCurrentUserMessageNode, GetCurrentUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetUserMessageTextNode, GetUserMessageTextNode.metadata);
  registerNodeWithMetadata(LiteGraph, HasCurrentUserMessageNode, HasCurrentUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, ClearUserMessageNode, ClearUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetMentionedFilesNode, GetMentionedFilesNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetMentionedMCPsNode, GetMentionedMCPsNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetCurrentFileNode, GetCurrentFileNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetSelectionNode, GetSelectionNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetRemixPromptNode, GetRemixPromptNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetUploadedImagesNode, GetUploadedImagesNode.metadata);
  registerNodeWithMetadata(LiteGraph, SetUserSessionDataNode, SetUserSessionDataNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetUserSessionDataNode, GetUserSessionDataNode.metadata);

  // VectorDB nodes
  registerNodeWithMetadata(LiteGraph, GetVectorNode, GetVectorNode.metadata);
  registerNodeWithMetadata(LiteGraph, AddVectorItemNode, AddVectorItemNode.metadata);
  registerNodeWithMetadata(LiteGraph, QueryVectorItemNode, QueryVectorItemNode.metadata);
  registerNodeWithMetadata(LiteGraph, QueryVectorItemsNode, QueryVectorItemsNode.metadata);

  // Utils nodes
  registerNodeWithMetadata(LiteGraph, EditFileAndApplyDiffNode, EditFileAndApplyDiffNode.metadata);

  // Output Parser nodes
  registerNodeWithMetadata(LiteGraph, ParseCSVNode, ParseCSVNode.metadata);
  registerNodeWithMetadata(LiteGraph, ParseJSONNode, ParseJSONNode.metadata);
  registerNodeWithMetadata(LiteGraph, ParseXMLNode, ParseXMLNode.metadata);
  registerNodeWithMetadata(LiteGraph, ParseTextNode, ParseTextNode.metadata);
  registerNodeWithMetadata(LiteGraph, ParseErrorsNode, ParseErrorsNode.metadata);
  registerNodeWithMetadata(LiteGraph, ParseWarningsNode, ParseWarningsNode.metadata);

  // Action Plan nodes
  registerNodeWithMetadata(LiteGraph, GetAllPlansNode, GetAllPlansNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetPlanDetailNode, GetPlanDetailNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetActionPlanDetailNode, GetActionPlanDetailNode.metadata);
  registerNodeWithMetadata(LiteGraph, CreateActionPlanNode, CreateActionPlanNode.metadata);
  registerNodeWithMetadata(LiteGraph, UpdateActionPlanNode, UpdateActionPlanNode.metadata);
  registerNodeWithMetadata(LiteGraph, AddTaskToActionPlanNode, AddTaskToActionPlanNode.metadata);
  registerNodeWithMetadata(LiteGraph, StartTaskStepNode, StartTaskStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, StartTaskStepWithListenerNode, StartTaskStepWithListenerNode.metadata);

  // Browser Notification nodes
  registerNodeWithMetadata(LiteGraph, WebFetchRequestNode, WebFetchRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, WebFetchResponseNode, WebFetchResponseNode.metadata);
  registerNodeWithMetadata(LiteGraph, WebSearchRequestNode, WebSearchRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, WebSearchResponseNode, WebSearchResponseNode.metadata);

  // LLM Notification nodes
  registerNodeWithMetadata(LiteGraph, LLMInferenceRequestNode, LLMInferenceRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, LLMInferenceResponseNode, LLMInferenceResponseNode.metadata);
  registerNodeWithMetadata(LiteGraph, LLMGetTokenCountNode, LLMGetTokenCountNode.metadata);
  registerNodeWithMetadata(LiteGraph, LLMSendTokenCountResponseNode, LLMSendTokenCountResponseNode.metadata);

  // MCP Notification nodes
  registerNodeWithMetadata(LiteGraph, GetEnabledMCPServersRequestNode, GetEnabledMCPServersRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetEnabledMCPServersResultNode, GetEnabledMCPServersResultNode.metadata);
  registerNodeWithMetadata(LiteGraph, ListToolsFromMCPServersRequestNode, ListToolsFromMCPServersRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, ListToolsFromMCPServersResultNode, ListToolsFromMCPServersResultNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetToolsRequestNode, GetToolsRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetToolsResultNode, GetToolsResultNode.metadata);
  registerNodeWithMetadata(LiteGraph, ExecuteToolRequestNode, ExecuteToolRequestNode.metadata);
  registerNodeWithMetadata(LiteGraph, ExecuteToolResultNode, ExecuteToolResultNode.metadata);

  // Unified Agent nodes
  registerNodeWithMetadata(LiteGraph, UnifiedAgentNode, UnifiedAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, AgentStepNode, AgentStepNode.metadata);
  registerNodeWithMetadata(LiteGraph, InitialPromptGeneratorNode, InitialPromptGeneratorNode.metadata);
  registerNodeWithMetadata(LiteGraph, ResponseExecutorNode, ResponseExecutorNode.metadata);
  registerNodeWithMetadata(LiteGraph, ToolNode, ToolNode.metadata);
  registerNodeWithMetadata(LiteGraph, WorkflowNode, WorkflowNode.metadata);
  registerNodeWithMetadata(LiteGraph, MessageProcessorNode, MessageProcessorNode.metadata);

  // Terminal nodes
  registerNodeWithMetadata(LiteGraph, ExecuteCommandNode, ExecuteCommandNode.metadata);
  registerNodeWithMetadata(LiteGraph, ExecuteCommandRunUntilErrorNode, ExecuteCommandRunUntilErrorNode.metadata);
  registerNodeWithMetadata(LiteGraph, SendManualInterruptNode, SendManualInterruptNode.metadata);
  registerNodeWithMetadata(LiteGraph, ExecuteCommandWithStreamNode, ExecuteCommandWithStreamNode.metadata);

  // Code Utils nodes
  registerNodeWithMetadata(LiteGraph, GetAllFilesAsMarkDownNode, GetAllFilesAsMarkDownNode.metadata);
  registerNodeWithMetadata(LiteGraph, PerformMatchNode, PerformMatchNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetMatcherListNode, GetMatcherListNode.metadata);
  registerNodeWithMetadata(LiteGraph, MatchDetailNode, MatchDetailNode.metadata);

  // Debug nodes
  registerNodeWithMetadata(LiteGraph, DebugNode, DebugNode.metadata);
  registerNodeWithMetadata(LiteGraph, OpenDebugBrowserNode, OpenDebugBrowserNode.metadata);

  // State nodes
  registerNodeWithMetadata(LiteGraph, GetApplicationStateNode, GetApplicationStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, AddToAgentStateNode, AddToAgentStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetAgentStateNode, GetAgentStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetProjectStateNode, GetProjectStateNode.metadata);
  registerNodeWithMetadata(LiteGraph, UpdateProjectStateNode, UpdateProjectStateNode.metadata);

  // Tokenizer nodes
  registerNodeWithMetadata(LiteGraph, AddTokenNode, AddTokenNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetTokenNode, GetTokenNode.metadata);

  // Inference nodes
  registerNodeWithMetadata(LiteGraph, InferenceNode, InferenceNode.metadata);
  registerNodeWithMetadata(LiteGraph, GetModelConfigNode, GetModelConfigNode.metadata);
  // // AI Agent nodes
  // registerNodeWithMetadata(LiteGraph, UserMessageNode, UserMessageNode.metadata);
  // registerNodeWithMetadata(LiteGraph, SystemPromptNode, SystemPromptNode.metadata);
  // registerNodeWithMetadata(LiteGraph, MCPToolsNode, MCPToolsNode.metadata);
  // registerNodeWithMetadata(LiteGraph, TaskInstructionNode, TaskInstructionNode.metadata);
  // registerNodeWithMetadata(LiteGraph, AgentRunNode, AgentRunNode.metadata);

  // Other existing nodes (these can be refactored later using the same pattern)
  LiteGraph.registerNodeType("basic/jsonparse", JSONParseNode);
  LiteGraph.registerNodeType("graph/subgraph", SubgraphNode);
  LiteGraph.registerNodeType("graph/input", GraphInputNode);
  LiteGraph.registerNodeType("graph/output", GraphOutputNode);

  // Math nodes (legacy - not refactored yet)
  LiteGraph.registerNodeType("math/converter", ConverterNode);
  LiteGraph.registerNodeType("math/range", RangeNode);
  LiteGraph.registerNodeType("math/lerp", LerpNode);
  LiteGraph.registerNodeType("math/floor", FloorNode);
  LiteGraph.registerNodeType("math/frac", FracNode);
  LiteGraph.registerNodeType("math/smoothstep", SmoothStepNode);
  LiteGraph.registerNodeType("math/scale", ScaleNode);
  LiteGraph.registerNodeType("math/gate", GateNode);
  LiteGraph.registerNodeType("math/operation", OperationNode);

  // Logic nodes (legacy - not refactored yet)
  LiteGraph.registerNodeType("logic/sequence", SequenceNode);
  LiteGraph.registerNodeType("logic/AND", AndNode);
  LiteGraph.registerNodeType("logic/IF", BranchNode);

  // String nodes (legacy - not refactored yet)
  // LiteGraph.registerNodeType("string/concatenate", ConcatenateNode);
  // LiteGraph.registerNodeType("string/split", SplitNode);
  // LiteGraph.registerNodeType("string/toFixed", ToFixedNode); // File doesn't exist - commented out
  // LiteGraph.registerNodeType("string/toTable", StringToTableNode);

  // Interface nodes
  // LiteGraph.registerNodeType("widget/knob", WidgetKnobNode);
  // LiteGraph.registerNodeType("widget/hslider", WidgetHSliderNode);
  // LiteGraph.registerNodeType("widget/progress", WidgetProgressNode);
  // LiteGraph.registerNodeType("widget/text", WidgetTextNode);
  // LiteGraph.registerNodeType("widget/panel", WidgetPanelNode);
};