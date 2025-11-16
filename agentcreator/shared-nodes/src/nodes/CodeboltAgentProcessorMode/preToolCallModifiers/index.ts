// Pre-Tool Call Modifier Nodes - Base implementations for shared functionality

export * from './BaseToolValidationNode';
export * from './BaseLocalToolInterceptorNode';
export * from './BaseToolParameterModifierNode';

// Array of all pre-tool call modifier node classes for easy registration
export const PreToolCallModifierNodes = [
  () => import('./BaseToolValidationNode'),
  () => import('./BaseLocalToolInterceptorNode'),
  () => import('./BaseToolParameterModifierNode')
];

// Pre-tool call modifier node types for registration
export const PreToolCallModifierNodeTypes = [
  'codebolt/agentProcessor/preToolCall/toolValidation',
  'codebolt/agentProcessor/preToolCall/localToolInterceptor',
  'codebolt/agentProcessor/preToolCall/toolParameterModifier'
];