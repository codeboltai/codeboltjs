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

// Widget nodes
export { MarkdownNode } from './MarkdownNode.js';

// Codebolt nodes
export * from './BaseCodeboltApis/index.js';

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
import { MarkdownNode as BackendMarkdownNode } from './MarkdownNode.js';
import { UserMessageNode as BackendUserMessageNode } from './UserMessageNode.js';
import { SystemPromptNode as BackendSystemPromptNode } from './SystemPromptNode.js';
import { MCPToolsNode as BackendMCPToolsNode } from './MCPToolsNode.js';
import { TaskInstructionNode as BackendTaskInstructionNode } from './TaskInstructionNode.js';
import { AgentNode as BackendAgentNode } from './AgentNode.js';
import { AgentRunNode as BackendAgentRunNode } from './AgentRunNode.js';
import { OnMessageNode as BackendOnMessageNode } from './BaseCodeboltApis/events/OnMessageNode.js';
import { SendMessageNode as BackendSendMessageNode } from './BaseCodeboltApis/chat/SendMessageNode.js';

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
  registerNodeWithMetadata(LiteGraph, BackendMarkdownNode, BackendMarkdownNode.metadata);

  // Register Event nodes
  registerNodeWithMetadata(LiteGraph, BackendOnMessageNode, BackendOnMessageNode.metadata);

  // Register Codebolt nodes
  registerNodeWithMetadata(LiteGraph, BackendSendMessageNode, BackendSendMessageNode.metadata);

  // Register AI Agent nodes
  registerNodeWithMetadata(LiteGraph, BackendUserMessageNode, BackendUserMessageNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendSystemPromptNode, BackendSystemPromptNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendMCPToolsNode, BackendMCPToolsNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendTaskInstructionNode, BackendTaskInstructionNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAgentNode, BackendAgentNode.metadata);
  registerNodeWithMetadata(LiteGraph, BackendAgentRunNode, BackendAgentRunNode.metadata);
}