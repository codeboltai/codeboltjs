// Message Modifier Nodes - Base implementations for shared functionality

export * from './BaseEnvironmentContextModifierNode';
export * from './BaseCoreSystemPromptModifierNode';
export * from './BaseDirectoryContextModifierNode';
export * from './BaseIdeContextModifierNode';
export * from './BaseAtFileProcessorModifierNode';
export * from './BaseArgumentProcessorModifierNode';
export * from './BaseMemoryImportModifierNode';
export * from './BaseToolInjectionModifierNode';
export * from './BaseChatRecordingModifierNode';
export * from './BaseChatHistoryMessageModifierNode';

// Array of all message modifier node classes for easy registration
export const MessageModifierNodes = [
  // Import classes dynamically when needed
  () => import('./BaseEnvironmentContextModifierNode'),
  () => import('./BaseCoreSystemPromptModifierNode'),
  () => import('./BaseDirectoryContextModifierNode'),
  () => import('./BaseIdeContextModifierNode'),
  () => import('./BaseAtFileProcessorModifierNode'),
  () => import('./BaseArgumentProcessorModifierNode'),
  () => import('./BaseMemoryImportModifierNode'),
  () => import('./BaseToolInjectionModifierNode'),
  () => import('./BaseChatRecordingModifierNode'),
  () => import('./BaseChatHistoryMessageModifierNode')
];

// Message modifier node types for registration
export const MessageModifierNodeTypes = [
  'codebolt/agentProcessor/messageModifiers/environmentContext',
  'codebolt/agentProcessor/messageModifiers/coreSystemPrompt',
  'codebolt/agentProcessor/messageModifiers/directoryContext',
  'codebolt/agentProcessor/messageModifiers/ideContext',
  'codebolt/agentProcessor/messageModifiers/atFileProcessor',
  'codebolt/agentProcessor/messageModifiers/argumentProcessor',
  'codebolt/agentProcessor/messageModifiers/memoryImport',
  'codebolt/agentProcessor/messageModifiers/toolInjection',
  'codebolt/agentProcessor/messageModifiers/chatRecording',
  'codebolt/agentProcessor/messageModifiers/chatHistory'
];