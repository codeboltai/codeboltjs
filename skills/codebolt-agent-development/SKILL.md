---
name: codebolt-agent-development
description: Build AI agents using the @codebolt/agent library. Use when creating new Codebolt agents, configuring agent processors, writing custom message modifiers, implementing tool-based agents, building multi-step workflows, or any task involving the agent framework including CodeboltAgent, message modifiers, pre/post inference processors, tool call processors, and workflow orchestration.
---

# Codebolt Agent Development

## Architecture Overview

Codebolt agents process messages through a pipeline:

```
User Input → Message Modifiers → Pre-Inference → LLM → Post-Inference → Tool Execution → Response
```

**Core components:**
- **CodeboltAgent**: High-level agent with defaults (recommended)
- **Agent**: Lower-level agent with full control
- **Message Modifiers**: Transform input before LLM
- **Processors**: Hook into pre/post inference and tool execution
- **Workflows**: Multi-step orchestration

## Quick Start

### Basic Agent

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

const agent = new CodeboltAgent({
  instructions: 'You are a helpful coding assistant.',
  enableLogging: true
});

const result = await agent.processMessage({
  userMessage: 'Help me write a function',
  threadId: 'thread-123',
  messageId: 'msg-456'
});
```

### Agent with Custom Modifiers

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
  CoreSystemPromptModifier,
  ChatHistoryMessageModifier,
  ToolInjectionModifier,
  IdeContextModifier
} from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are a code assistant.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier({ customSystemPrompt: 'Custom instructions...' }),
      new ChatHistoryMessageModifier({ maxHistoryMessages: 10 }),
      new ToolInjectionModifier({ toolsLocation: 'Tool' }),
      new IdeContextModifier({ includeActiveFile: true })
    ]
  }
});
```

## Creating Custom Modifiers

Extend `BaseMessageModifier`:

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';

class CustomModifier extends BaseMessageModifier {
  async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
    // Add custom context
    const newMessages = [...createdMessage.message.messages];
    newMessages.push({ role: 'system', content: 'Custom context here' });

    return {
      message: { ...createdMessage.message, messages: newMessages },
      metadata: { ...createdMessage.metadata, customModifierApplied: true }
    };
  }
}
```

## Creating Custom Processors

Four processor types available:

| Processor Type | When It Runs | Use Case |
|---------------|--------------|----------|
| `BasePreInferenceProcessor` | Before LLM call | Input validation, final adjustments |
| `BasePostInferenceProcessor` | After LLM response | Response filtering, validation |
| `BasePreToolCallProcessor` | Before tool execution | Permission checks, interception |
| `BasePostToolCallProcessor` | After tool execution | Result logging, transformation |

```typescript
import { BasePreToolCallProcessor } from '@codebolt/agent/processor-pieces';

class ToolPermissionProcessor extends BasePreToolCallProcessor {
  async process(toolCall: ToolCall, context: ToolCallContext): Promise<ToolCallDecision> {
    if (toolCall.function.name === 'dangerous-tool') {
      return { proceed: false, reason: 'Tool not allowed' };
    }
    return { proceed: true };
  }
}
```

## Creating Tools

Use Zod schemas for type-safe tools:

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const myTool = createTool({
  id: 'search-files',
  description: 'Search for files matching a pattern',
  inputSchema: z.object({
    pattern: z.string().describe('Glob pattern'),
    directory: z.string().optional().describe('Starting directory')
  }),
  execute: async ({ input, context }) => {
    // Implementation
    return { files: ['file1.ts', 'file2.ts'] };
  }
});
```

## Building Workflows

```typescript
import { Workflow } from '@codebolt/agent/unified';

const workflow = new Workflow({
  name: 'Code Review',
  steps: [
    {
      id: 'lint',
      execute: async (context) => {
        return { success: true, data: { lintPassed: true } };
      }
    },
    {
      id: 'test',
      condition: (context) => context.lintPassed,  // Conditional execution
      execute: async (context) => {
        return { success: true, data: { testsPassed: true } };
      }
    }
  ]
});

const result = await workflow.executeAsync();
```

## Available Message Modifiers

| Modifier | Purpose |
|----------|---------|
| `CoreSystemPromptModifier` | Inject system prompt and memory |
| `ChatHistoryMessageModifier` | Add conversation history |
| `ToolInjectionModifier` | Add available tools |
| `EnvironmentContextModifier` | Add OS, date, time |
| `DirectoryContextModifier` | Add project structure |
| `IdeContextModifier` | Add IDE state (active file, cursor) |
| `AtFileProcessorModifier` | Process @file mentions |
| `MemoryImportModifier` | Import stored memory |
| `ImageAttachmentMessageModifier` | Handle images |

## Key Imports

```typescript
// Core agent classes
import { CodeboltAgent, Agent, Workflow, createTool } from '@codebolt/agent/unified';

// Base components
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';

// Modifiers and processors
import {
  BaseMessageModifier,
  CoreSystemPromptModifier,
  ChatHistoryMessageModifier,
  ToolInjectionModifier,
  BasePreInferenceProcessor,
  BasePostInferenceProcessor,
  BasePreToolCallProcessor,
  BasePostToolCallProcessor
} from '@codebolt/agent/processor-pieces';
```

## References

- **API Reference**: See [references/api_reference.md](references/api_reference.md) for complete API documentation
- **Examples**: See [references/examples.md](references/examples.md) for detailed code examples
