// Message Modifier Nodes - Base implementations for shared functionality
export { BaseEnvironmentContextModifierNode } from './BaseEnvironmentContextModifierNode';
export { BaseCoreSystemPromptModifierNode } from './BaseCoreSystemPromptModifierNode';
export { BaseDirectoryContextModifierNode } from './BaseDirectoryContextModifierNode';
export { BaseIdeContextModifierNode } from './BaseIdeContextModifierNode';
export { BaseAtFileProcessorModifierNode } from './BaseAtFileProcessorModifierNode';
export { BaseArgumentProcessorModifierNode } from './BaseArgumentProcessorModifierNode';
export { BaseMemoryImportModifierNode } from './BaseMemoryImportModifierNode';
export { BaseToolInjectionModifierNode } from './BaseToolInjectionModifierNode';
export { BaseChatRecordingModifierNode } from './BaseChatRecordingModifierNode';
export { BaseChatHistoryMessageModifierNode } from './BaseChatHistoryMessageModifierNode';

// Import for internal use
import { BaseEnvironmentContextModifierNode } from './BaseEnvironmentContextModifierNode';
import { BaseCoreSystemPromptModifierNode } from './BaseCoreSystemPromptModifierNode';
import { BaseDirectoryContextModifierNode } from './BaseDirectoryContextModifierNode';
import { BaseIdeContextModifierNode } from './BaseIdeContextModifierNode';
import { BaseAtFileProcessorModifierNode } from './BaseAtFileProcessorModifierNode';
import { BaseArgumentProcessorModifierNode } from './BaseArgumentProcessorModifierNode';
import { BaseMemoryImportModifierNode } from './BaseMemoryImportModifierNode';
import { BaseToolInjectionModifierNode } from './BaseToolInjectionModifierNode';
import { BaseChatRecordingModifierNode } from './BaseChatRecordingModifierNode';
import { BaseChatHistoryMessageModifierNode } from './BaseChatHistoryMessageModifierNode';

// Array of all message modifier node classes for easy registration
export const MessageModifierNodes = [
  BaseEnvironmentContextModifierNode,
  BaseCoreSystemPromptModifierNode,
  BaseDirectoryContextModifierNode,
  BaseIdeContextModifierNode,
  BaseAtFileProcessorModifierNode,
  BaseArgumentProcessorModifierNode,
  BaseMemoryImportModifierNode,
  BaseToolInjectionModifierNode,
  BaseChatRecordingModifierNode,
  BaseChatHistoryMessageModifierNode
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