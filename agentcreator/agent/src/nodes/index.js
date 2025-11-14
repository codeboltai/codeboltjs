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

// Event nodes
export { OnMessageNode } from './BaseCodeboltApis/OnMessageNode.js';

// Codebolt nodes
export { SendMessageNode } from './BaseCodeboltApis/SendMessageNode.js';

// AI Agent nodes
export { UserMessageNode } from './UserMessageNode.js';
export { SystemPromptNode } from './SystemPromptNode.js';
export { MCPToolsNode } from './MCPToolsNode.js';
export { TaskInstructionNode } from './TaskInstructionNode.js';
export { AgentNode } from './AgentNode.js';
export { AgentRunNode } from './AgentRunNode.js';

// Backend node registration utility
import { LiteGraph } from '@codebolt/litegraph';
import { registerNodeWithMetadata, nodeMetadata } from '@agent-creator/shared-nodes';
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
import { OnMessageNode as BackendOnMessageNode } from './BaseCodeboltApis/OnMessageNode.js';
import { SendMessageNode as BackendSendMessageNode } from './BaseCodeboltApis/SendMessageNode.js';

export function registerBackendNodes() {
  // Register backend execution nodes
  registerNodeWithMetadata(LiteGraph, BackendConstNode, nodeMetadata['basic/const']);
  registerNodeWithMetadata(LiteGraph, BackendSumNode, nodeMetadata['basic/sum']);
  registerNodeWithMetadata(LiteGraph, BackendTimeNode, nodeMetadata['basic/time']);
  registerNodeWithMetadata(LiteGraph, BackendConstantNumberNode, nodeMetadata['basic/const_number']);
  registerNodeWithMetadata(LiteGraph, BackendBypassNode, nodeMetadata['math/bypass']);
  registerNodeWithMetadata(LiteGraph, BackendToNumberNode, nodeMetadata['math/to_number']);
  registerNodeWithMetadata(LiteGraph, BackendRandNode, nodeMetadata['math/rand']);
  registerNodeWithMetadata(LiteGraph, BackendAbsNode, nodeMetadata['math/abs']);
  registerNodeWithMetadata(LiteGraph, BackendClampNode, nodeMetadata['math/clamp']);
  registerNodeWithMetadata(LiteGraph, BackendOrNode, nodeMetadata['logic/OR']);
  registerNodeWithMetadata(LiteGraph, BackendNotNode, nodeMetadata['logic/NOT']);
  registerNodeWithMetadata(LiteGraph, BackendSelectorNode, nodeMetadata['logic/selector']);
  registerNodeWithMetadata(LiteGraph, BackendToStringNode, nodeMetadata['string/toString']);
  registerNodeWithMetadata(LiteGraph, BackendCompareNode, nodeMetadata['string/compare']);
  registerNodeWithMetadata(LiteGraph, BackendToUpperCaseNode, nodeMetadata['string/toUpperCase']);
  registerNodeWithMetadata(LiteGraph, BackendContainsNode, nodeMetadata['string/contains']);
  registerNodeWithMetadata(LiteGraph, BackendMarkdownNode, nodeMetadata['widget/markdown']);

  // Register Event nodes
  registerNodeWithMetadata(LiteGraph, BackendOnMessageNode, nodeMetadata['events/onmessage']);

  // Register Codebolt nodes
  registerNodeWithMetadata(LiteGraph, BackendSendMessageNode, nodeMetadata['codebolt/chat/sendmessage']);

  // Register AI Agent nodes
  registerNodeWithMetadata(LiteGraph, BackendUserMessageNode, nodeMetadata['agent/user_message']);
  registerNodeWithMetadata(LiteGraph, BackendSystemPromptNode, nodeMetadata['agent/system_prompt']);
  registerNodeWithMetadata(LiteGraph, BackendMCPToolsNode, nodeMetadata['agent/mcp_tools']);
  registerNodeWithMetadata(LiteGraph, BackendTaskInstructionNode, nodeMetadata['agent/task_instruction']);
  registerNodeWithMetadata(LiteGraph, BackendAgentNode, nodeMetadata['agent/agent']);
  registerNodeWithMetadata(LiteGraph, BackendAgentRunNode, nodeMetadata['agent/agent_run']);
}