// Post-Inference Processor Nodes - Base implementations for shared functionality
import { BaseChatCompressionModifierNode } from './BaseChatCompressionModifierNode';
import { BaseLoopDetectionModifierNode } from './BaseLoopDetectionModifierNode';

// Export all post-inference processor node classes
export { BaseChatCompressionModifierNode };
export { BaseLoopDetectionModifierNode };

// Array of all post-inference processor node classes for easy registration
export const PostInferenceProcessorNodes = [
  BaseChatCompressionModifierNode,
  BaseLoopDetectionModifierNode
];

// Post-inference processor node types for registration
export const PostInferenceProcessorNodeTypes = [
  'codebolt/agentProcessor/postInference/chatCompression',
  'codebolt/agentProcessor/postInference/loopDetection'
];