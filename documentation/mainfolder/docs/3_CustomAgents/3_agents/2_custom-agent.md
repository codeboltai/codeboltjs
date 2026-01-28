# Creating Custom Agents

This guide walks you through creating custom agents using the `@codebolt/agent` framework.

## Introduction

Custom agents allow you to tailor Codebolt's capabilities to your exact requirements, coding standards, and workflow preferences.

By the end of this guide, you'll know how to:
- Create agents using `CodeboltAgent` and `Agent` classes
- Add custom tools to agents
- Configure processors for enhanced behavior
- Handle errors and debug agents

## Quick Start

### Basic Agent

```typescript
import { CodeboltAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

// Create a tool
const greetTool = createTool({
  id: 'greet',
  description: 'Greet a user by name',
  inputSchema: z.object({
    name: z.string()
  }),
  execute: async ({ input }) => {
    return { message: `Hello, ${input.name}!` };
  }
});

// Create an agent
const agent = new CodeboltAgent({
  instructions: 'You are a friendly assistant that greets users.',
  tools: [greetTool]
});

// Use the agent
const result = await agent.execute({
  role: 'user',
  content: 'Please greet John'
});

console.log(result);
```

### Using Factory Function

```typescript
import { createCodeboltAgent, createTool } from '@codebolt/agent/unified';

const agent = createCodeboltAgent({
  systemPrompt: 'You are a helpful assistant.',
  tools: [myTool]
});
```

## Adding Processors

Processors customize agent behavior at different execution stages.

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
  EnvironmentContextModifier,
  DirectoryContextModifier,
  ToolValidationModifier,
  ConversationCompactorModifier,
  LoopDetectionModifier
} from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are an enhanced assistant.',
  tools: [myTools],

  // Add context to messages
  messageModifiers: [
    new EnvironmentContextModifier(),
    new DirectoryContextModifier()
  ],

  // Detect infinite loops
  postInferenceProcessors: [
    new LoopDetectionModifier({ maxIterations: 10 })
  ],

  // Validate tool calls
  preToolCallProcessors: [
    new ToolValidationModifier()
  ],

  // Manage conversation length
  postToolCallProcessors: [
    new ConversationCompactorModifier({ maxConversationLength: 30 })
  ]
});
```

## Creating Custom Tools

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const searchTool = createTool({
  id: 'search',
  description: 'Search for information',
  inputSchema: z.object({
    query: z.string(),
    maxResults: z.number().optional().default(10)
  }),
  execute: async ({ input, context }) => {
    // Implement search logic
    const results = await performSearch(input.query, input.maxResults);
    return { results };
  }
});

const agent = new CodeboltAgent({
  instructions: 'You help users find information.',
  tools: [searchTool]
});
```

## Error Handling

```typescript
const result = await agent.execute({
  role: 'user',
  content: 'Do something complex'
});

if (!result.success) {
  console.error('Agent execution failed:', result.error);
  // Handle the error appropriately
} else {
  console.log('Result:', result.result);
}
```

## Using the Base Agent Class

For more control over agent configuration:

```typescript
import { Agent } from '@codebolt/agent/unified';
import { ToolValidationModifier } from '@codebolt/agent/processor-pieces';

const agent = new Agent({
  name: 'My Custom Agent',
  instructions: 'You are a specialized assistant.',
  tools: [myTools],

  preToolCallProcessors: [
    new ToolValidationModifier({ strictMode: true })
  ]
});

const result = await agent.execute({
  role: 'user',
  content: 'Help me with a task'
});
```

## Debugging Agents

Use `ChatRecordingModifier` to log conversations:

```typescript
import { ChatRecordingModifier } from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are a debug agent.',
  tools: [myTools],

  messageModifiers: [
    new ChatRecordingModifier({
      enabled: true,
      outputPath: './debug-logs'
    })
  ]
});
```

## Best Practices

1. **Clear Instructions**: Write specific, actionable system instructions
2. **Appropriate Tools**: Only include tools relevant to the agent's purpose
3. **Error Handling**: Always check `result.success` before using results
4. **Use Processors**: Add processors for validation and conversation management
5. **Test Thoroughly**: Test with various inputs and edge cases

## Available Imports

```typescript
// Core classes and functions
import {
  Agent,
  CodeboltAgent,
  createCodeboltAgent,
  Tool,
  createTool,
  Workflow,
  AgentStep,
  InitialPromptGenerator,
  ResponseExecutor
} from '@codebolt/agent/unified';

// Processors
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
  ChatHistoryMessageModifier,
  ChatCompressionModifier,
  LoopDetectionModifier,
  ToolParameterModifier,
  ToolValidationModifier,
  ConversationCompactorModifier,
  ShellProcessorModifier
} from '@codebolt/agent/processor-pieces';
```
