// Pre-Tool Call Modifier Nodes - Base implementations for shared functionality
import { BaseToolValidationNode } from './BaseToolValidationNode';
import { BaseLocalToolInterceptorNode } from './BaseLocalToolInterceptorNode';
import { BaseToolParameterModifierNode } from './BaseToolParameterModifierNode';

// Export all pre-tool call modifier node classes
export { BaseToolValidationNode };
export { BaseLocalToolInterceptorNode };
export { BaseToolParameterModifierNode };

// Array of all pre-tool call modifier node classes for easy registration
export const PreToolCallModifierNodes = [
  BaseToolValidationNode,
  BaseLocalToolInterceptorNode,
  BaseToolParameterModifierNode
];

// Pre-tool call modifier node types for registration
export const PreToolCallModifierNodeTypes = [
  'codebolt/agentProcessor/preToolCall/toolValidation',
  'codebolt/agentProcessor/preToolCall/localToolInterceptor',
  'codebolt/agentProcessor/preToolCall/toolParameterModifier'
];