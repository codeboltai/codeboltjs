# Processors

Processors are extensible components that customize and enhance the behavior of agents at different stages of execution. They are imported from `@codebolt/agent/processor-pieces`.

## Processor Categories

The framework organizes processors into five categories based on when they execute:

1. **Message Modifiers** - Transform user messages before processing
2. **PreInference Processors** - Run before LLM calls
3. **PostInference Processors** - Run after LLM calls, before tool execution
4. **PreToolCall Processors** - Validate/modify tool calls before execution
5. **PostToolCall Processors** - Process tool results and update prompts

## Message Modifiers

Transform user messages into prompts. These run during the initial prompt generation phase.

### EnvironmentContextModifier

Adds environment context (system info, environment variables) to messages.

```typescript
import { EnvironmentContextModifier } from '@codebolt/agent/processor-pieces';

const modifier = new EnvironmentContextModifier({
  // Configuration options
});
```

### CoreSystemPromptModifier

Handles core system prompt configuration.

```typescript
import { CoreSystemPromptModifier } from '@codebolt/agent/processor-pieces';

const modifier = new CoreSystemPromptModifier({
  // Configuration options
});
```

### DirectoryContextModifier

Adds working directory context to messages.

```typescript
import { DirectoryContextModifier } from '@codebolt/agent/processor-pieces';

const modifier = new DirectoryContextModifier({
  // Configuration options
});
```

### IdeContextModifier

Adds IDE integration context (open files, workspace info).

```typescript
import { IdeContextModifier } from '@codebolt/agent/processor-pieces';

const modifier = new IdeContextModifier({
  // Configuration options
});
```

### AtFileProcessorModifier

Processes @file references in messages, expanding them to file contents.

```typescript
import { AtFileProcessorModifier } from '@codebolt/agent/processor-pieces';

const modifier = new AtFileProcessorModifier({
  // Configuration options
});
```

### ArgumentProcessorModifier

Processes command-line style arguments in messages.

```typescript
import { ArgumentProcessorModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ArgumentProcessorModifier({
  // Configuration options
});
```

### MemoryImportModifier

Imports memory/context from previous sessions.

```typescript
import { MemoryImportModifier } from '@codebolt/agent/processor-pieces';

const modifier = new MemoryImportModifier({
  // Configuration options
});
```

### ToolInjectionModifier

Injects tool descriptions into prompts.

```typescript
import { ToolInjectionModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ToolInjectionModifier({
  // Configuration options
});
```

### ChatRecordingModifier

Records chat history for persistence and debugging.

```typescript
import { ChatRecordingModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ChatRecordingModifier({
  enabled: true,
  outputPath: './chat-logs'
});
```

### ChatHistoryMessageModifier

Includes conversation history in messages.

```typescript
import { ChatHistoryMessageModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ChatHistoryMessageModifier({
  // Configuration options
});
```

## PreInference Processors

Run before the LLM is called. Used for optimizing prompts.

### ChatCompressionModifier

Compresses chat history to reduce token usage.

```typescript
import { ChatCompressionModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ChatCompressionModifier({
  // Configuration options
});
```

## PostInference Processors

Run after the LLM responds but before tool execution. Used for response validation and loop detection.

### LoopDetectionModifier

Detects and prevents infinite loops in agent execution.

```typescript
import { LoopDetectionModifier } from '@codebolt/agent/processor-pieces';

const modifier = new LoopDetectionModifier({
  maxIterations: 10,
  // Additional configuration options
});
```

## PreToolCall Processors

Run before tool calls are executed. Used for validation and parameter modification.

### ToolParameterModifier

Modifies tool parameters before execution.

```typescript
import { ToolParameterModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ToolParameterModifier({
  // Configuration options
});
```

### ToolValidationModifier

Validates tool calls before execution.

```typescript
import { ToolValidationModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ToolValidationModifier({
  strictMode: true,
  // Additional configuration options
});
```

## PostToolCall Processors

Run after tool calls complete. Used for processing results and managing conversation.

### ConversationCompactorModifier

Compacts long conversations to stay within token limits.

```typescript
import { ConversationCompactorModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ConversationCompactorModifier({
  maxConversationLength: 50,
  // Additional configuration options
});
```

### ShellProcessorModifier

Processes shell command outputs.

```typescript
import { ShellProcessorModifier } from '@codebolt/agent/processor-pieces';

const modifier = new ShellProcessorModifier();
```

## Using Processors in Agents

### With CodeboltAgent

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
  EnvironmentContextModifier,
  DirectoryContextModifier,
  ToolValidationModifier,
  ConversationCompactorModifier,
  ChatCompressionModifier,
  LoopDetectionModifier
} from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are an enhanced agent.',
  tools: [myTool],

  // Message modifiers - transform initial message
  messageModifiers: [
    new EnvironmentContextModifier(),
    new DirectoryContextModifier()
  ],

  // Pre-inference - before LLM call
  preInferenceProcessors: [
    new ChatCompressionModifier()
  ],

  // Post-inference - after LLM call
  postInferenceProcessors: [
    new LoopDetectionModifier({ maxIterations: 10 })
  ],

  // Pre-tool call - before executing tools
  preToolCallProcessors: [
    new ToolValidationModifier({ strictMode: true })
  ],

  // Post-tool call - after tool execution
  postToolCallProcessors: [
    new ConversationCompactorModifier({ maxConversationLength: 30 })
  ]
});
```

### With Base Agent Class

```typescript
import { Agent } from '@codebolt/agent/unified';
import {
  ToolValidationModifier,
  ConversationCompactorModifier
} from '@codebolt/agent/processor-pieces';

const agent = new Agent({
  name: 'Custom Agent',
  instructions: 'You are a custom agent.',
  tools: [myTool],

  preToolCallProcessors: [new ToolValidationModifier()],
  postToolCallProcessors: [new ConversationCompactorModifier()]
});
```

## Processor Execution Flow

```
User Message
    │
    ▼
┌─────────────────────────┐
│   Message Modifiers     │  ← Transform message to prompt
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ PreInference Processors │  ← Optimize before LLM call
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│      LLM Inference      │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│PostInference Processors │  ← Validate response, detect loops
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ PreToolCall Processors  │  ← Validate tool calls
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│    Tool Execution       │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│PostToolCall Processors  │  ← Process results, compact conversation
└─────────────────────────┘
    │
    ▼
 Next Iteration or Response
```

## Best Practices

### Development vs Production

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const agent = new CodeboltAgent({
  instructions: 'You are a configurable agent.',
  tools: [myTool],

  messageModifiers: [
    // Always include
    new EnvironmentContextModifier(),

    // Development only
    ...(isDevelopment ? [
      new ChatRecordingModifier({ outputPath: './dev-logs' })
    ] : [])
  ],

  postToolCallProcessors: [
    new ConversationCompactorModifier()
  ]
});
```

### Performance Optimization

```typescript
// Lightweight configuration for performance-critical applications
const performanceAgent = new CodeboltAgent({
  instructions: 'You are an optimized agent.',
  tools: [myTool],

  postToolCallProcessors: [
    new ConversationCompactorModifier({
      maxConversationLength: 20  // Smaller conversation window
    })
  ],

  preToolCallProcessors: [
    new ToolValidationModifier({
      strictMode: false  // Less strict for performance
    })
  ]
});
```

## Available Processors Summary

| Category | Processor | Purpose |
|----------|-----------|---------|
| Message Modifiers | `EnvironmentContextModifier` | Add environment context |
| Message Modifiers | `CoreSystemPromptModifier` | Core system prompt handling |
| Message Modifiers | `DirectoryContextModifier` | Working directory context |
| Message Modifiers | `IdeContextModifier` | IDE integration context |
| Message Modifiers | `AtFileProcessorModifier` | Process @file references |
| Message Modifiers | `ArgumentProcessorModifier` | Process arguments |
| Message Modifiers | `MemoryImportModifier` | Import memory context |
| Message Modifiers | `ToolInjectionModifier` | Inject tool descriptions |
| Message Modifiers | `ChatRecordingModifier` | Record chat history |
| Message Modifiers | `ChatHistoryMessageModifier` | Include chat history |
| PreInference | `ChatCompressionModifier` | Compress chat history |
| PostInference | `LoopDetectionModifier` | Detect execution loops |
| PreToolCall | `ToolParameterModifier` | Modify tool parameters |
| PreToolCall | `ToolValidationModifier` | Validate tool calls |
| PostToolCall | `ConversationCompactorModifier` | Compact conversations |
| PostToolCall | `ShellProcessorModifier` | Process shell output |
