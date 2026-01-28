# Processor Types

Processors are extensible components that modify behavior at different stages of agent execution. All processors use the `*Modifier` suffix and are imported from `@codebolt/agent/processor-pieces`.

## Types of Processors

### 1. Message Modifiers

Transform user messages into prompts. Called by the `InitialPromptGenerator`.

**Interface:**
```typescript
// Input
{
  originalRequest,
  createdMessage,
  context
}

// Output
{
  createdMessage
}
```

**Available Modifiers:**
- `EnvironmentContextModifier` - Add environment context
- `CoreSystemPromptModifier` - Core system prompt handling
- `DirectoryContextModifier` - Working directory context
- `IdeContextModifier` - IDE integration context
- `AtFileProcessorModifier` - Process @file references
- `ArgumentProcessorModifier` - Process arguments
- `MemoryImportModifier` - Import memory context
- `ToolInjectionModifier` - Inject tool descriptions
- `ChatRecordingModifier` - Record chat history
- `ChatHistoryMessageModifier` - Include chat history

### 2. PreInference Processors

Run before the LLM is called. Called by `AgentStep`.

**Interface:**
```typescript
// Input
{
  initialUserMessage,
  currentMessage,
  exitEvent
}

// Output
{
  currentMessage
}
```

**Available Processors:**
- `ChatCompressionModifier` - Compress chat history to reduce tokens

### 3. PostInference Processors

Run after LLM response, before tool execution. Called by `AgentStep`.

**Interface:**
```typescript
// Input
{
  llmMessageSent,
  llmResponseMessage,
  nextPrompt,
  context
}

// Output
{
  nextPrompt,
  context
}
```

Special events:
- `llmInferenceTriggerEvent` - Triggers re-calling the LLM (e.g., for invalid responses)
- `exitEvent` - Exits the system with an error (e.g., for detected loops)

**Available Processors:**
- `LoopDetectionModifier` - Detect and prevent infinite loops

### 4. PreToolCall Processors

Run before tool execution. Called by `ResponseExecutor`.

**Interface:**
```typescript
// Input
{
  llmMessageSent,
  llmResponseMessage,
  nextPrompt,
  context
}

// Output
{
  nextPrompt,
  context,
  shouldExit
}
```

**Available Processors:**
- `ToolParameterModifier` - Modify tool parameters before execution
- `ToolValidationModifier` - Validate tool calls before execution

### 5. PostToolCall Processors

Run after tool execution. Called by `ResponseExecutor`.

**Interface:**
```typescript
// Input
{
  userMessage,
  llmMessageSent,
  llmResponseMessage,
  nextPrompt,
  context
}

// Output
{
  nextPrompt,
  context
}
```

**Available Processors:**
- `ConversationCompactorModifier` - Compact long conversations
- `ShellProcessorModifier` - Process shell command outputs

## Import Example

```typescript
import {
  // Message Modifiers
  EnvironmentContextModifier,
  CoreSystemPromptModifier,
  DirectoryContextModifier,
  ToolInjectionModifier,
  ChatRecordingModifier,

  // PreInference Processors
  ChatCompressionModifier,

  // PostInference Processors
  LoopDetectionModifier,

  // PreToolCall Processors
  ToolParameterModifier,
  ToolValidationModifier,

  // PostToolCall Processors
  ConversationCompactorModifier,
  ShellProcessorModifier
} from '@codebolt/agent/processor-pieces';
```
