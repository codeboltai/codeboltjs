/**
 * LLM SDK Function Types
 * Types for the cbllm module functions
 */

// ================================
// Message Types
// ================================

/**
 * Represents a message in the conversation with roles and content.
 */
export interface MessageObject {
  /** The role of the message sender: user, assistant, tool, or system */
  role: 'user' | 'assistant' | 'tool' | 'system';
  /** The content of the message, can be an array of content blocks or a string */
  content: string | Array<{
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
  // /** Optional ID for tool calls */
  tool_call_id?: string; // used in tool call result
  // /** Optional tool calls for assistant messages */
  // tool_calls?: ToolCall[];
  // /** Optional name for the message */
  // name?: string;
}

/**
 * Represents a tool call in OpenAI format
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  /** The type of tool call */
  type: 'function';
  /** Function call details */
  function: {
    /** Name of the function to call */
    name: string;
    /** Arguments for the function call as JSON string */
    arguments: string;
  };
}

/**
 * Represents a tool definition in OpenAI format
 */
export interface Tool {
  /** The type of tool */
  type: 'function';
  /** Function definition */
  function: {
    /** Name of the function */
    name: string;
    /** Description of what the function does */
    description?: string;
    /** JSON schema for the function parameters */
    parameters?: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

// ================================
// LLM Inference Parameters
// ================================

/**
 * Tool choice options for LLM inference
 */
export type ToolChoice = 'auto' | 'none' | 'required' | {
  type: 'function';
  function: {
    name: string;
  };
};

/**
 * LLM inference request parameters
 */
export interface LLMInferenceParams {
  /** Array of messages in the conversation */
  messages: MessageObject[];
  /** Available tools for the model to use */
  tools?: Tool[];
  /** How the model should use tools */
  tool_choice?: ToolChoice;
  /** Whether to return full response */
  full?: boolean;
  /** The LLM role to determine which model to use */
  llmrole?: string;
  /** Maximum number of tokens to generate */
  max_tokens?: number;
  /** Temperature for response generation */
  temperature?: number;
  /** Whether to stream the response */
  stream?: boolean;
}

// ================================
// Response Types
// ================================

/**
 * Base response interface for LLM operations
 */
export interface BaseLLMSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Usage statistics for token consumption
 */
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Choice in LLM response
 */
export interface LLMChoice {
  message: {
    role: string;
    content: string;
    tool_calls?: ToolCall[];
  };
  finish_reason: string;
  index?: number;
}

/**
 * LLM completion response
 */
export interface LLMCompletion {
  content: string;
  role: 'assistant';
  model?: string;
  usage?: TokenUsage;
  finish_reason?: string;
  choices?: LLMChoice[];
  tool_calls?: ToolCall[];
}

/**
 * LLM response interface
 */
export interface LLMResponse extends BaseLLMSDKResponse {
  content: string;
  role: 'assistant';
  model?: string;
  usage?: TokenUsage;
  finish_reason?: string;
  choices?: LLMChoice[];
  tool_calls?: ToolCall[];
}

/**
 * Inference response wrapper
 */
export interface InferenceResponse {
  completion: LLMCompletion;
}
