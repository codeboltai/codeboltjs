# codebolt.llm - Language Model Interface

This module provides functionality to interact with Language Learning Models (LLMs) via WebSocket, supporting inference requests and model configuration queries.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseLLMResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### MessageObject

Represents a message in the conversation with roles and content.

```typescript
interface MessageObject {
  role: 'user' | 'assistant' | 'tool' | 'system';  // The role of the message sender
  content: string | Array<{                         // The content of the message
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
  tool_call_id?: string;    // Optional ID for tool calls (used in tool call result)
  tool_calls?: ToolCall[];  // Optional tool calls for assistant messages
  name?: string;            // Optional name for the message
}
```

### ToolCall

Represents a tool call in OpenAI format.

```typescript
interface ToolCall {
  id: string;               // Unique identifier for this tool call
  type: 'function';         // The type of tool call
  function: {
    name: string;           // Name of the function to call
    arguments: string;      // Arguments for the function call as JSON string
  };
}
```

### Tool

Represents a tool definition in OpenAI format.

```typescript
interface Tool {
  type: 'function';         // The type of tool
  function: {
    name: string;                     // Name of the function
    description?: string;             // Description of what the function does
    parameters?: {
      type: 'object';                 // Must be 'object'
      properties: Record<string, unknown>;  // JSON schema for the function parameters
      required?: string[];            // Required parameter names
    };
  };
}
```

### TokenUsage

Usage statistics for token consumption.

```typescript
interface TokenUsage {
  prompt_tokens: number;      // Number of tokens in the prompt
  completion_tokens: number;   // Number of tokens in the completion
  total_tokens: number;        // Total number of tokens used
}
```

### LLMChoice

Choice in LLM response.

```typescript
interface LLMChoice {
  message: {
    role: string;               // Usually 'assistant'
    content: string;           // The message content
    tool_calls?: ToolCall[];   // Optional tool calls made by the model
  };
  finish_reason: string;       // Reason for completion (e.g., 'stop', 'length', 'tool_calls')
  index?: number;              // Index of this choice
}
```

### LLMCompletion

LLM completion response.

```typescript
interface LLMCompletion {
  content: string;               // The generated content
  role: 'assistant';             // Always 'assistant'
  model?: string;                // Model name used
  usage?: TokenUsage;            // Token usage statistics
  finish_reason?: string;        // Reason for completion
  choices?: LLMChoice[];         // Multiple choices if requested
  tool_calls?: ToolCall[];       // Tool calls made by the model
}
```

### LLMModelConfig

LLM model configuration interface.

```typescript
interface LLMModelConfig {
  llm_id: string;                           // Unique LLM identifier
  user_model_name: string | null;           // User-defined model name
  model_name: string;                       // Actual model name
  datetime: string;                         // Configuration datetime (ISO format)
  max_tokens: number;                       // Maximum tokens for input
  max_output_tokens: number;                // Maximum output tokens
  cached_token: string | null;              // Cached token information
  input_cost_per_token: number;            // Cost per input token
  output_cost_per_token: number;           // Cost per output token
  litellm_provider: string;                // LiteLLM provider name
  mode: string;                             // Model mode (e.g., 'chat')
  supports_function_calling: number;       // Whether model supports function calling (0/1)
  supports_parallel_function_calling: number | null;  // Whether model supports parallel function calling
  supports_vision: number | null;           // Whether model supports vision
  source: string | null;                    // Model source
  max_input_tokens: number;                 // Maximum input tokens
}
```

## Methods

### `inference(params)`

Sends an inference request to the LLM using OpenAI message format with tools support. The model is selected based on the provided `llmrole`. If the specific model for the role is not found, it falls back to the default model for the current agent, and ultimately to the default application-wide LLM if necessary.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| params | object | Yes | Inference parameters object |
| params.messages | MessageObject[] | Yes | Array of conversation messages |
| params.tools | Tool[] | No | Available tools for the model to use |
| params.tool_choice | 'auto' \| 'none' \| 'required' \| {type: 'function', function: {name: string}} | No | How the model should use tools |
| params.llmrole | string | No | The LLM role to determine which model to use |
| params.full | boolean | No | Whether to return full response |
| params.max_tokens | number | No | Maximum number of tokens to generate |
| params.temperature | number | No | Temperature for response generation (0-1) |
| params.stream | boolean | No | Whether to stream the response |

**Response:**
```typescript
{
  completion: {
    content: string;               // The generated content
    role: 'assistant';             // Always 'assistant'
    model?: string;                // Model name used
    usage?: {                      // Token usage statistics
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    finish_reason?: string;        // Reason for completion
    choices?: Array<{              // Multiple choices if requested
      message: {
        role: string;
        content: string;
        tool_calls?: ToolCall[];
      };
      finish_reason: string;
      index?: number;
    }>;
    tool_calls?: ToolCall[];       // Tool calls made by the model
  };
}
```

```typescript
const result = await codebolt.llm.inference({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ],
  llmrole: 'default',
  temperature: 0.7,
  max_tokens: 100
});

if (result.completion) {
  console.log('Response:', result.completion.content);
  console.log('Tokens used:', result.completion.usage?.total_tokens);
  console.log('Model:', result.completion.model);
}
```

---

### `getModelConfig(modelId?)`

Gets the model configuration for a specific model or the default application model. If modelId is provided, returns configuration for that specific model. If modelId is not provided, returns the default application LLM configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| modelId | string | No | Optional model identifier. If not provided, returns default model config. |

**Response:**
```typescript
{
  success: boolean;                                    // Whether the operation succeeded
  config?: {                                          // Model configuration (null if not found)
    llm_id: string;                                   // Unique LLM identifier
    user_model_name: string | null;                   // User-defined model name
    model_name: string;                               // Actual model name
    datetime: string;                                 // Configuration datetime
    max_tokens: number;                               // Maximum tokens for input
    max_output_tokens: number;                        // Maximum output tokens
    cached_token: string | null;                      // Cached token information
    input_cost_per_token: number;                     // Cost per input token
    output_cost_per_token: number;                    // Cost per output token
    litellm_provider: string;                         // LiteLLM provider name
    mode: string;                                     // Model mode
    supports_function_calling: number;                 // Supports function calling (0/1)
    supports_parallel_function_calling: number | null; // Supports parallel function calling
    supports_vision: number | null;                    // Supports vision
    source: string | null;                             // Model source
    max_input_tokens: number;                         // Maximum input tokens
  };
  error?: string;                                     // Error details if operation failed
}
```

```typescript
const result = await codebolt.llm.getModelConfig();

if (result.success && result.config) {
  console.log('Model:', result.config.model_name);
  console.log('Provider:', result.config.litellm_provider);
  console.log('Max tokens:', result.config.max_output_tokens);
  console.log('Cost per input token:', result.config.input_cost_per_token);
}
```

---

### `getModelConfig(modelId)` - With specific model

```typescript
const result = await codebolt.llm.getModelConfig('gpt-4');

if (result.success && result.config) {
  console.log('Found config for:', result.config.model_name);
  console.log('Supports functions:', result.config.supports_function_calling === 1);
} else if (result.error) {
  console.log('Error:', result.error);
}
```

## Examples

### Basic Chat Completion

```typescript
// Simple chat completion
const result = await codebolt.llm.inference({
  messages: [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: 'Write a function to reverse a string in JavaScript.' }
  ],
  llmrole: 'default',
  temperature: 0.5
});

if (result.completion) {
  console.log('Response:', result.completion.content);
  
  if (result.completion.usage) {
    console.log(`Tokens: ${result.completion.usage.total_tokens} ` +
                `(input: ${result.completion.usage.prompt_tokens}, ` +
                `output: ${result.completion.usage.completion_tokens})`);
  }
}
```

### Function Calling with Tools

```typescript
// Define tools for the model
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA'
          }
        },
        required: ['location']
      }
    }
  }
];

// Request with tools
const result = await codebolt.llm.inference({
  messages: [
    { role: 'user', content: 'What is the weather in New York?' }
  ],
  tools: tools,
  tool_choice: 'auto',
  llmrole: 'default'
});

if (result.completion) {
  // Check if the model wants to call a function
  if (result.completion.tool_calls && result.completion.tool_calls.length > 0) {
    for (const toolCall of result.completion.tool_calls) {
      console.log('Function:', toolCall.function.name);
      console.log('Arguments:', toolCall.function.arguments);
    }
  } else {
    console.log('Response:', result.completion.content);
  }
}
```

### Conversation with Context

```typescript
// Multi-turn conversation
const conversation = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is Python?' },
  { role: 'assistant', content: 'Python is a high-level programming language...' },
  { role: 'user', content: 'How do I install it?' }
];

const result = await codebolt.llm.inference({
  messages: conversation,
  llmrole: 'default',
  temperature: 0.7,
  max_tokens: 200
});

if (result.completion) {
  console.log('Assistant:', result.completion.content);
  
  // Continue the conversation
  conversation.push({ role: 'assistant', content: result.completion.content });
  conversation.push({ role: 'user', content: 'What are its main uses?' });
  
  const followUp = await codebolt.llm.inference({
    messages: conversation,
    llmrole: 'default'
  });
  
  console.log('Follow-up:', followUp.completion?.content);
}
```

### Model Configuration Query

```typescript
// Check default model configuration
const defaultConfig = await codebolt.llm.getModelConfig();

if (defaultConfig.success && defaultConfig.config) {
  console.log('Default Model:', defaultConfig.config.model_name);
  console.log('Provider:', defaultConfig.config.litellm_provider);
  console.log('Max Output Tokens:', defaultConfig.config.max_output_tokens);
  console.log('Function Calling:', defaultConfig.config.supports_function_calling === 1 ? 'Yes' : 'No');
}

// Compare multiple model configurations
const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3'];

for (const modelId of models) {
  const result = await codebolt.llm.getModelConfig(modelId);
  
  if (result.success && result.config) {
    console.log(`\n${modelId}:`);
    console.log('  Input cost:', result.config.input_cost_per_token);
    console.log('  Output cost:', result.config.output_cost_per_token);
    console.log('  Vision support:', result.config.supports_vision === 1 ? 'Yes' : 'No');
  } else {
    console.log(`\n${modelId}: Not found (${result.error})`);
  }
}
```
