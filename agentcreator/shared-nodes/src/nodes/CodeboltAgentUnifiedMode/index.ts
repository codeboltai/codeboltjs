// Export all unified agent nodes
export * from './Agent';
export * from './AgentStep';
export * from './InitialPromptGenerator';
export * from './ResponseExecutor';
export * from './Tool';
export * from './Workflow';
export * from './MessageProcessor';
export * from './CodeboltAgent';

// Import all node classes for registration
import { BaseAgentNode } from './Agent';
import { BaseAgentStepNode } from './AgentStep';
import { BaseInitialPromptGeneratorNode } from './InitialPromptGenerator';
import { BaseResponseExecutorNode } from './ResponseExecutor';
import { BaseToolNode } from './Tool';
import { BaseWorkflowNode } from './Workflow';
import { BaseMessageProcessorNode } from './MessageProcessor';
import { BaseCodeboltAgentNode } from './CodeboltAgent';

// Array of all unified agent nodes for easy registration
export const UnifiedAgentNodes = [
  BaseAgentNode,
  BaseAgentStepNode,
  BaseInitialPromptGeneratorNode,
  BaseResponseExecutorNode,
  BaseToolNode,
  BaseWorkflowNode,
  BaseMessageProcessorNode,
  BaseCodeboltAgentNode
];

// Node categories for organization
export const UnifiedAgentCategories = {
  'unified/agent': 'Agent Nodes',
  'unified/workflow': 'Workflow Nodes',
  'unified/tools': 'Tool Nodes'
};