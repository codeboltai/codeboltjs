// Post-Inference Processor Nodes - Base implementations for shared functionality

export * from './BaseChatCompressionModifierNode';
export * from './BaseLoopDetectionModifierNode';

// Array of all post-inference processor node classes for easy registration
export const PostInferenceProcessorNodes = [
  () => import('./BaseChatCompressionModifierNode'),
  () => import('./BaseLoopDetectionModifierNode')
];

// Post-inference processor node types for registration
export const PostInferenceProcessorNodeTypes = [
  'codebolt/agentProcessor/postInference/chatCompression',
  'codebolt/agentProcessor/postInference/loopDetection'
];