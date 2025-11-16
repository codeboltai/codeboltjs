// Post-Tool Call Modifier Nodes - Base implementations for shared functionality

export * from './BaseShellProcessorModifierNode';
export * from './BaseConversationCompactorNode';
export * from './BaseFollowUpConversationNode';
export * from './BaseConversationContinuityNode';

// Array of all post-tool call modifier node classes for easy registration
export const PostToolCallModifierNodes = [
  () => import('./BaseShellProcessorModifierNode'),
  () => import('./BaseConversationCompactorNode'),
  () => import('./BaseFollowUpConversationNode'),
  () => import('./BaseConversationContinuityNode')
];

// Post-tool call modifier node types for registration
export const PostToolCallModifierNodeTypes = [
  'codebolt/agentProcessor/postToolCall/shellProcessor',
  'codebolt/agentProcessor/postToolCall/conversationCompactor',
  'codebolt/agentProcessor/postToolCall/followUpConversation',
  'codebolt/agentProcessor/postToolCall/conversationContinuity'
];