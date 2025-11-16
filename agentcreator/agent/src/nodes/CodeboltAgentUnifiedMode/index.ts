// Export all unified agent nodes
export * from './Agent';
export * from './AgentStep';
export * from './InitialPromptGenerator';
export * from './ResponseExecutor';
export * from './Tool';
export * from './Workflow';
export * from './MessageProcessor';

// Import all node classes for registration
import { AgentNode } from './Agent';
import { AgentStepNode } from './AgentStep';
import { InitialPromptGeneratorNode } from './InitialPromptGenerator';
import { ResponseExecutorNode } from './ResponseExecutor';
import { ToolNode } from './Tool';
import { WorkflowNode } from './Workflow';
import { MessageProcessorNode } from './MessageProcessor';

// Array of all unified agent nodes for easy registration
export const UnifiedAgentNodes = [
  AgentNode,
  AgentStepNode,
  InitialPromptGeneratorNode,
  ResponseExecutorNode,
  ToolNode,
  WorkflowNode,
  MessageProcessorNode
];