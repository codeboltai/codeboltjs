// Post-Tool Call Modifier Nodes - Base implementations for shared functionality
import { BaseShellProcessorModifierNode } from './BaseShellProcessorModifierNode';
import { BaseConversationCompactorNode } from './BaseConversationCompactorNode';
import { BaseFollowUpConversationNode } from './BaseFollowUpConversationNode';
import { BaseConversationContinuityNode } from './BaseConversationContinuityNode';

// Export all post-tool call modifier node classes
export { BaseShellProcessorModifierNode };
export { BaseConversationCompactorNode };
export { BaseFollowUpConversationNode };
export { BaseConversationContinuityNode };

// Array of all post-tool call modifier node classes for easy registration
export const PostToolCallModifierNodes = [
  BaseShellProcessorModifierNode,
  BaseConversationCompactorNode,
  BaseFollowUpConversationNode,
  BaseConversationContinuityNode
];

// Post-tool call modifier node types for registration
export const PostToolCallModifierNodeTypes = [
  'codebolt/agentProcessor/postToolCall/shellProcessor',
  'codebolt/agentProcessor/postToolCall/conversationCompactor',
  'codebolt/agentProcessor/postToolCall/followUpConversation',
  'codebolt/agentProcessor/postToolCall/conversationContinuity'
];