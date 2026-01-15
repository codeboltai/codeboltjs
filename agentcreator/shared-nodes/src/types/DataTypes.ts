/**
 * Custom data types for LiteGraph node connections
 * Used for type validation in extra_info metadata
 */

// Custom data types for the system
export const DATA_TYPES = {
  // Message types
  FLAT_USER_MESSAGE: 'FlatUserMessage',

  // File and path types
  FILE_PATH: 'filePath',
  FULL_PATH: 'fullPath',
  FOLDER_PATH: 'folderPath',
  IMAGE_PATH: 'imagePath',
  CONTROL_FILE: 'controlFile',

  // Agent and action types
  SELECTED_AGENT: 'selectedAgent',
  AGENT: 'agent',
  ACTION: 'action',

  // Selection types
  SELECTION: 'selection',

  // Document and link types
  DOCUMENT: 'document',
  LINK: 'link',
  MULTI_FILE: 'multiFile',

  // Server types
  MCP_SERVER: 'mcpServer',

  // ID types
  MESSAGE_ID: 'messageId',
  THREAD_ID: 'threadId',
  TEMPLATE_TYPE: 'templateType',
  PROCESS_ID: 'processId',

  // Configuration types
  REMIX_PROMPT: 'remixPrompt',

  // Processor configuration types
  TOOL_CONFIG: 'toolConfig',
  ENVIRONMENT_CONTEXT: 'environmentContext',
  IDE_CONTEXT: 'ideContext',
  DIRECTORY_STRUCTURE: 'directoryStructure',
  CHAT_HISTORY: 'chatHistory',
  MEMORY_IMPORT: 'memoryImport',
  RECORDING_CONFIG: 'recordingConfig',
  COMPRESSION_CONFIG: 'compressionConfig',
  LOOP_DETECTION_CONFIG: 'loopDetectionConfig',
  SHELL_CONFIG: 'shellConfig',
  TOOL_VALIDATION_CONFIG: 'toolValidationConfig',
  CONVERSATION_CONFIG: 'conversationConfig',
  PROCESSED_MESSAGE: 'processedMessage',
  ARGUMENT_PROCESSOR: 'argumentProcessor',

  // Unified Agent configuration types
  UNIFIED_AGENT_CONFIG: 'unifiedAgentConfig',
  AGENT_CONFIG: 'agentConfig',
  WORKFLOW_CONFIG: 'workflowConfig',

  // Execution and result types
  AGENT_STEP_OUTPUT: 'agentStepOutput',
  RESPONSE_INPUT: 'responseInput',
  RESPONSE_OUTPUT: 'responseOutput',
  WORKFLOW_RESULT: 'workflowResult',
  EXECUTION_CONTEXT: 'executionContext',
  TOOL_RESULT: 'toolResult',
  AGENT_EXECUTION_RESULT: 'agentExecutionResult'
} as const;

// Type definitions for the data types
export type DataType = typeof DATA_TYPES[keyof typeof DATA_TYPES];
export type ArrayType = typeof ARRAY_TYPES[keyof typeof ARRAY_TYPES];
export type ElementType = 'string' | 'number' | 'boolean' | 'object';

// Interface for extra_info metadata
export interface ExtraInfo {
  dataType?: DataType | string;
  arrayType?: ArrayType;
  elementType?: ElementType;
  acceptedTypes?: (DataType | string)[];
  description?: string;
}

// Array type definitions (used in extra_info.arrayType)
export const ARRAY_TYPES = {
  FILE_PATH: 'filePath',
  FULL_PATH: 'fullPath',
  FOLDER_PATH: 'folderPath',
  IMAGE_PATH: 'imagePath',
  CONTROL_FILE: 'controlFile',
  MCP_SERVER: 'mcpServer',
  ACTION: 'action',
  AGENT: 'agent',
  DOCUMENT: 'document',
  LINK: 'link',
  MULTI_FILE: 'multiFile',
  OPENED_FILE: 'filePath', // For openedFiles array

  // Processor array types
  TOOL_LIST: 'toolList',
  FILE_LIST: 'fileList',
  DIRECTORY_LIST: 'directoryList',
  CHAT_ENTRY: 'chatEntry',
  MEMORY_ENTRY: 'memoryEntry',
  EXTENSION_LIST: 'extensionList',
  PATTERN_LIST: 'patternList',
  COMMAND_LIST: 'commandList',

  // Unified Agent array types
  MESSAGE_MODIFIER: 'messageModifier',
  PRE_INFERENCE_PROCESSOR: 'preInferenceProcessor',
  POST_INFERENCE_PROCESSOR: 'postInferenceProcessor',
  WORKFLOW_STEP: 'workflowStep',
  TOOL_RESULT: 'toolResult'
} as const;

// Utility functions for type validation
export function isCustomDataType(type: string): boolean {
  return Object.values(DATA_TYPES).includes(type as any);
}

export function isArrayType(type: string): boolean {
  return Object.values(ARRAY_TYPES).includes(type as any);
}

export function getDataTypeDescription(dataType: string): string {
  const descriptions: Record<string, string> = {
    [DATA_TYPES.FLAT_USER_MESSAGE]: 'Complete user message object with all properties',
    [DATA_TYPES.FILE_PATH]: 'Path to a file',
    [DATA_TYPES.FULL_PATH]: 'Full path to a file or resource',
    [DATA_TYPES.FOLDER_PATH]: 'Path to a folder',
    [DATA_TYPES.IMAGE_PATH]: 'Path or URL to an image',
    [DATA_TYPES.SELECTED_AGENT]: 'Selected agent information with id, name, type',
    [DATA_TYPES.AGENT]: 'Agent object with configuration',
    [DATA_TYPES.ACTION]: 'Action object representing a user action',
    [DATA_TYPES.SELECTION]: 'Selection object with ranges and selected text',
    [DATA_TYPES.MCP_SERVER]: 'MCP server configuration object',
    [DATA_TYPES.MESSAGE_ID]: 'Unique message identifier',
    [DATA_TYPES.THREAD_ID]: 'Conversation thread identifier',
    [DATA_TYPES.TEMPLATE_TYPE]: 'Template type identifier',
    [DATA_TYPES.PROCESS_ID]: 'Process identifier',
    [DATA_TYPES.REMIX_PROMPT]: 'Remix prompt configuration object',

    // Processor configuration types
    [DATA_TYPES.TOOL_CONFIG]: 'Tool configuration and injection settings',
    [DATA_TYPES.ENVIRONMENT_CONTEXT]: 'System environment and project context',
    [DATA_TYPES.IDE_CONTEXT]: 'IDE/editor state with open files and cursor position',
    [DATA_TYPES.DIRECTORY_STRUCTURE]: 'Directory tree structure and file hierarchy',
    [DATA_TYPES.CHAT_HISTORY]: 'Conversation history and previous messages',
    [DATA_TYPES.MEMORY_IMPORT]: 'Memory import configuration and file references',
    [DATA_TYPES.RECORDING_CONFIG]: 'Chat recording and persistence settings',
    [DATA_TYPES.COMPRESSION_CONFIG]: 'Chat compression and token management settings',
    [DATA_TYPES.LOOP_DETECTION_CONFIG]: 'Loop detection parameters and thresholds',
    [DATA_TYPES.SHELL_CONFIG]: 'Shell execution security and command restrictions',
    [DATA_TYPES.TOOL_VALIDATION_CONFIG]: 'Tool validation and schema checking settings',
    [DATA_TYPES.CONVERSATION_CONFIG]: 'Conversation management and continuity settings',
    [DATA_TYPES.PROCESSED_MESSAGE]: 'Processed message with enhancements and modifications',
    [DATA_TYPES.ARGUMENT_PROCESSOR]: 'Argument processing configuration and formatting',

    // Unified Agent configuration types
    [DATA_TYPES.UNIFIED_AGENT_CONFIG]: 'Complete unified agent configuration with LLM settings and limits',
    [DATA_TYPES.AGENT_CONFIG]: 'Agent configuration with processors, instructions, and tools',
    [DATA_TYPES.WORKFLOW_CONFIG]: 'Workflow configuration with steps and validation schemas',

    // Execution and result types
    [DATA_TYPES.AGENT_STEP_OUTPUT]: 'Output from agent step execution with LLM response',
    [DATA_TYPES.RESPONSE_INPUT]: 'Input for response executor with LLM output and context',
    [DATA_TYPES.RESPONSE_OUTPUT]: 'Output from response executor with tool results and completion status',
    [DATA_TYPES.WORKFLOW_RESULT]: 'Workflow execution result with step results and metadata',
    [DATA_TYPES.EXECUTION_CONTEXT]: 'Execution context with session and tracking information',
    [DATA_TYPES.TOOL_RESULT]: 'Tool execution result with success status and data',
    [DATA_TYPES.AGENT_EXECUTION_RESULT]: 'Complete agent execution result with conversation history and tool results'
  };

  return descriptions[dataType] || `Custom data type: ${dataType}`;
}