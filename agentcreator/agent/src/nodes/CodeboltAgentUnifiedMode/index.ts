// Export all unified agent nodes
export * from './Agent/index.js';
export * from './AgentStep/index.js';
export * from './InitialPromptGenerator/index.js';
export * from './ResponseExecutor/index.js';
export * from './Tool/index.js';
export * from './Workflow/index.js';
export * from './MessageProcessor/index.js';
export * from './CodeboltAgent/index.js';

// Import all node classes for registration
import { AgentNode } from './Agent/index.js';
import { AgentStepNode } from './AgentStep/index.js';
import { InitialPromptGeneratorNode } from './InitialPromptGenerator/index.js';
import { ResponseExecutorNode } from './ResponseExecutor/index.js';
import { ToolNode } from './Tool/index.js';
import { WorkflowNode } from './Workflow/index.js';
import { MessageProcessorNode } from './MessageProcessor/index.js';
import { CodeboltAgentNode } from './CodeboltAgent/index.js';

// Array of all unified agent nodes for easy registration
export const UnifiedAgentNodes = [
  AgentNode,
  AgentStepNode,
  InitialPromptGeneratorNode,
  ResponseExecutorNode,
  ToolNode,
  WorkflowNode,
  MessageProcessorNode,
  CodeboltAgentNode
];