# Core Functions

The agent framework uses three core functions that handle the execution pipeline. Each function uses specific processor types.

## 1. InitialPromptGenerator

Converts the user's input message into a prompt that can be sent to the LLM.

**Uses:** Message Modifiers

### Input
- **UserMessage** - Initial message from the user
- **Context** - Object for inter-processor communication
- **BaseSystemPrompt** - Base system prompt to build upon
- **MessageModifiers** - List of Message Modifiers to apply

### Output
- **CreatedMessage** - The prompt to send to the LLM (may be modified by PreInference Processors before sending)
- **Context** - Updated context object

### Available Message Modifiers

```typescript
import {
  EnvironmentContextModifier,
  CoreSystemPromptModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  AtFileProcessorModifier,
  ArgumentProcessorModifier,
  MemoryImportModifier,
  ToolInjectionModifier,
  ChatRecordingModifier,
  ChatHistoryMessageModifier
} from '@codebolt/agent/processor-pieces';
```

## 2. AgentStep

Handles the LLM inference step. Takes the prompt and passes it to the LLM.

**Uses:** PreInference Processors, PostInference Processors

### Input
- **InitialUserMessage** - Original user message (available for processors)
- **CreatedMessage** - Output from InitialPromptGenerator (or previous step)
- **PreInferenceProcessors** - Processors to run before LLM call
- **PostInferenceProcessors** - Processors to run after LLM call
- **LLMConfig** - Configuration for the LLM (temperature, etc.)

### Output
- **RawLLMOutput** - Raw response from the LLM
- **NextMessage** - Processed message for next step
- **Context** - Updated context object

### Available Processors

```typescript
import {
  // PreInference
  ChatCompressionModifier,

  // PostInference
  LoopDetectionModifier
} from '@codebolt/agent/processor-pieces';
```

## 3. ResponseExecutor

Handles tool execution and updates the prompt based on tool results.

**Uses:** PreToolCall Processors, PostToolCall Processors

### Input
- **UserMessage** - Original user message
- **RawLLMOutput** - Response from the LLM
- **NextMessage** - The message that was sent to the LLM
- **PreToolCallProcessors** - Processors to validate/modify tool calls
- **PostToolCallProcessors** - Processors to process tool results

### Output
- **NextPrompt** - Updated prompt for the next iteration
- **Context** - Updated context object

### Available Processors

```typescript
import {
  // PreToolCall
  ToolParameterModifier,
  ToolValidationModifier,

  // PostToolCall
  ConversationCompactorModifier,
  ShellProcessorModifier
} from '@codebolt/agent/processor-pieces';
```

## Execution Flow

```
User Message
    │
    ▼
┌─────────────────────────────────────┐
│     InitialPromptGenerator          │
│  (applies Message Modifiers)        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│           AgentStep                 │
│  1. PreInference Processors         │
│  2. LLM Call                        │
│  3. PostInference Processors        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│       ResponseExecutor              │
│  1. PreToolCall Processors          │
│  2. Tool Execution                  │
│  3. PostToolCall Processors         │
└─────────────────────────────────────┘
    │
    ▼
  Next Iteration (back to AgentStep)
  or Final Response
```

## Context Object

The context object enables inter-processor and inter-step communication:

```typescript
interface Context {
  // Built-in fields
  userId?: string;
  sessionId?: string;

  // Custom fields added by processors
  [key: string]: unknown;
}
```

Processors can read from and write to the context to share state.
