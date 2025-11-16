// Message Modifier Nodes - Base implementations for shared functionality
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