# Level 3: High-Level Abstractions

Production-ready agents with minimal setup using `CodeboltAgent` and `Agent` classes.

---

## CodeboltAgent (Recommended)

High-level agent with sensible defaults and automatic loop management.

### Basic Usage

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

const agent = new CodeboltAgent({
  instructions: 'You are a helpful coding assistant.',
  enableLogging: true
});

const result = await agent.processMessage({
  userMessage: 'Help me write a sorting function',
  threadId: 'thread-123',
  messageId: 'msg-456'
});

if (result.success) {
  console.log('Result:', result.result);
} else {
  console.error('Error:', result.error);
}
```

### Configuration

```typescript
interface CodeboltAgentConfig {
  instructions: string;             // System prompt (required)
  enableLogging?: boolean;          // Debug logging (default: true)
  processors?: {
    messageModifiers?: MessageModifier[];
    preInferenceProcessors?: PreInferenceProcessor[];
    postInferenceProcessors?: PostInferenceProcessor[];
    preToolCallProcessors?: PreToolCallProcessor[];
    postToolCallProcessors?: PostToolCallProcessor[];
  };
}
```

### Default Modifiers

If no `messageModifiers` provided, CodeboltAgent creates:
1. `ChatHistoryMessageModifier` - Conversation context
2. `EnvironmentContextModifier` - OS, date, timezone
3. `DirectoryContextModifier` - Folder structure
4. `IdeContextModifier` - Active file, open files, cursor
5. `CoreSystemPromptModifier` - Your instructions
6. `ToolInjectionModifier` - Available tools
7. `AtFileProcessorModifier` - @file mention expansion

### With Custom Processors

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
  CoreSystemPromptModifier,
  ChatHistoryMessageModifier,
  ToolInjectionModifier,
  IdeContextModifier,
  LoopDetectionModifier
} from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are a code review expert.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier({
        customSystemPrompt: `You are an expert code reviewer.
          Check for: security issues, performance, style, best practices.`
      }),
      new ChatHistoryMessageModifier({ maxHistoryMessages: 20 }),
      new ToolInjectionModifier({ toolsLocation: 'Tool' }),
      new IdeContextModifier({
        includeActiveFile: true,
        includeOpenFiles: true
      })
    ],
    postInferenceProcessors: [
      new LoopDetectionModifier({ enableLoopPrevention: true })
    ]
  },
  enableLogging: true
});
```

### Getter Methods

```typescript
agent.getConfig(): CodeboltAgentConfig
agent.getMessageModifiers(): MessageModifier[]
agent.getPreInferenceProcessors(): PreInferenceProcessor[]
agent.getPostInferenceProcessors(): PostInferenceProcessor[]
agent.getPreToolCallProcessors(): PreToolCallProcessor[]
agent.getPostToolCallProcessors(): PostToolCallProcessor[]
```

---

## Agent Class

Lower-level agent with more explicit configuration. Requires you to provide processors.

### Usage

```typescript
import { Agent } from '@codebolt/agent/unified';

const agent = new Agent({
  name: 'MyAgent',
  instructions: 'You are a helpful assistant.',
  processors: {
    messageModifiers: [...],
    preInferenceProcessors: [...],
    postInferenceProcessors: [...],
    preToolCallProcessors: [...],
    postToolCallProcessors: [...]
  },
  maxIterations: 20,
  enableLogging: true
});

const result = await agent.execute(userMessage);
```

### Configuration

```typescript
interface AgentConfig {
  name?: string;
  instructions: string;
  tools?: Tool[];
  processors?: {
    messageModifiers?: MessageModifier[];
    preInferenceProcessors?: PreInferenceProcessor[];
    postInferenceProcessors?: PostInferenceProcessor[];
    preToolCallProcessors?: PreToolCallProcessor[];
    postToolCallProcessors?: PostToolCallProcessor[];
  };
  maxIterations?: number;
  maxConversationLength?: number;
  llmConfig?: LLMConfig;
  enableLogging?: boolean;
  retryConfig?: {
    maxRetries?: number;
    retryDelay?: number;
  };
}
```

### Difference from CodeboltAgent

| Feature | CodeboltAgent | Agent |
|---------|---------------|-------|
| Default modifiers | Yes, creates defaults | No, uses only provided |
| Method name | `processMessage()` | `execute()` |
| Use case | Production-ready | Custom/building-block |
| Logging | Active by default | Explicit configuration |

---

## Factory Function

```typescript
import { createCodeboltAgent } from '@codebolt/agent/unified';

const agent = createCodeboltAgent({
  systemPrompt: 'You are a helpful assistant.',
  messageModifiers: [...],
  preInferenceProcessors: [...],
  postInferenceProcessors: [...],
  preToolCallProcessors: [...],
  postToolCallProcessors: [...],
  enableLogging: true
});
```

---

## Result Type

```typescript
import type { MessageObject } from '@codebolt/types/sdk';

// Generic AgentExecutionResult for type-safe results
interface AgentExecutionResult<T = unknown> {
  success: boolean;
  result?: T;                          // Typed result
  error?: string;
  conversation?: MessageObject[];
  toolsExecuted?: string[];
  iterationCount?: number;
}

// Example with typed result:
// const result: AgentExecutionResult<{ code: string; explanation: string }> = await agent.processMessage(msg);
```

---

## Common Patterns

### IDE-Aware Agent

```typescript
const agent = new CodeboltAgent({
  instructions: 'You are a coding assistant aware of the IDE state.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier(),
      new IdeContextModifier({
        includeActiveFile: true,
        includeOpenFiles: true,
        includeCursorPosition: true,
        includeSelectedText: true
      }),
      new DirectoryContextModifier({
        maxDepth: 3,
        excludePatterns: ['node_modules', '.git', 'dist']
      }),
      new ToolInjectionModifier()
    ]
  }
});
```

### Memory-Aware Agent

```typescript
import { MemoryImportModifier } from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'Use stored preferences when helping.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier(),
      new MemoryImportModifier({
        memoryKeys: ['user_preferences', 'project_context'],
        scope: 'user'
      }),
      new ToolInjectionModifier()
    ]
  }
});
```

### Agent with Custom Tool Filtering

```typescript
const agent = new CodeboltAgent({
  instructions: 'You can only use file operations.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier(),
      new ToolInjectionModifier({
        toolFilter: (tool) => tool.name.startsWith('codebolt--fs')
      })
    ]
  }
});
```

---

## Integration with Codebolt

```typescript
import codebolt from '@codebolt/codeboltjs';
import { CodeboltAgent } from '@codebolt/agent/unified';
import type { FlatUserMessage } from '@codebolt/types/sdk';

const agent = new CodeboltAgent({
  instructions: 'You are a coding assistant.'
});

// Handle user messages
codebolt.onMessage(async (userMessage: FlatUserMessage) => {
  const result = await agent.processMessage(userMessage);

  if (result.success) {
    codebolt.chat.sendMessage(result.result);
  } else {
    codebolt.chat.sendMessage(`Error: ${result.error}`);
  }
});

// Handle sub-agent invocations
codebolt.onActionBlockInvocation(async (context, metadata) => {
  const result = await agent.processMessage({
    userMessage: context.task,
    threadId: context.threadId,
    messageId: context.messageId
  });
  return result;
});
```
