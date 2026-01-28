# Agents

Agents are the primary interface for building intelligent AI systems. They handle conversation management, tool execution, and complex reasoning.

## Creating Agents

The framework provides two main ways to create agents:

### Using CodeboltAgent (Recommended)

```typescript
import { CodeboltAgent, createCodeboltAgent } from '@codebolt/agent/unified';

// Using the factory function
const agent = createCodeboltAgent({
  systemPrompt: 'You are a helpful customer support representative.',
  tools: [searchTool, ticketTool, emailTool]
});

// Or using the class directly
const agent = new CodeboltAgent({
  instructions: 'You are a helpful customer support representative.',
  tools: [searchTool, ticketTool, emailTool]
});
```

### Using Base Agent Class

For more control, you can use the base `Agent` class:

```typescript
import { Agent } from '@codebolt/agent/unified';
import {
  ToolValidationModifier,
  ConversationCompactorModifier
} from '@codebolt/agent/processor-pieces';

const agent = new Agent({
  name: 'Customer Support Agent',
  instructions: 'You are a helpful customer support representative.',
  tools: [searchTool, ticketTool, emailTool],

  // Custom processors
  preToolCallProcessors: [new ToolValidationModifier()],
  postToolCallProcessors: [new ConversationCompactorModifier()]
});
```

## Agent Execution

```typescript
// Execute with a message
const result = await agent.execute({
  role: 'user',
  content: 'Help me with my order #12345'
});

console.log({
  success: result.success,
  result: result.result,
  error: result.error
});
```

## Agent Configuration Options

### Basic Configuration

```typescript
const agent = new CodeboltAgent({
  instructions: 'You are helpful.',     // System instructions
  tools: [myTool],                      // Array of tools

  // Optional: Custom processors
  messageModifiers: [],
  preInferenceProcessors: [],
  postInferenceProcessors: [],
  preToolCallProcessors: [],
  postToolCallProcessors: []
});
```

### Adding Processors

```typescript
import {
  ConversationCompactorModifier,
  ToolValidationModifier,
  LoopDetectionModifier,
  ChatCompressionModifier
} from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are an enhanced agent.',
  tools: [myTool],

  // Post-tool call processors
  postToolCallProcessors: [
    new ConversationCompactorModifier({
      maxConversationLength: 30
    })
  ],

  // Pre-tool call processors
  preToolCallProcessors: [
    new ToolValidationModifier({
      strictMode: true
    })
  ],

  // Pre-inference processors
  preInferenceProcessors: [
    new ChatCompressionModifier()
  ],

  // Post-inference processors
  postInferenceProcessors: [
    new LoopDetectionModifier({
      maxIterations: 10
    })
  ]
});
```

## Context Management

```typescript
// Tools can access context
const contextAwareTool = createTool({
  id: 'context-tool',
  description: 'A context-aware tool',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ input, context }) => {
    const userId = context?.userId;
    const preferences = context?.preferences;

    return {
      message: `Hello user ${userId}`,
      language: preferences?.language || 'en'
    };
  }
});
```

## Error Handling

```typescript
const result = await agent.execute({
  role: 'user',
  content: 'User message'
});

if (!result.success) {
  console.error('Agent failed:', result.error);
}
```

## Agent Patterns

### Specialist Agents

```typescript
// Create domain-specific agents
const researchAgent = new CodeboltAgent({
  instructions: 'You are an expert researcher with access to academic databases and web search.',
  tools: [webSearchTool, academicSearchTool, citationTool]
});

const analysisAgent = new CodeboltAgent({
  instructions: 'You are a data analysis expert specializing in statistical analysis.',
  tools: [dataAnalysisTool, chartTool, statisticsTool]
});

const creativeAgent = new CodeboltAgent({
  instructions: 'You are a creative writing expert specializing in storytelling.',
  tools: [grammarTool, thesaurusTool, styleGuideTool]
});
```

### Agents with Message Modifiers

```typescript
import {
  EnvironmentContextModifier,
  DirectoryContextModifier,
  ToolInjectionModifier
} from '@codebolt/agent/processor-pieces';

const enhancedAgent = new CodeboltAgent({
  instructions: 'You are a file system assistant.',
  tools: [fileTools],

  messageModifiers: [
    new EnvironmentContextModifier(),
    new DirectoryContextModifier(),
    new ToolInjectionModifier()
  ]
});
```

## Available Processors

### Message Modifiers
Transform user messages into prompts:
- `EnvironmentContextModifier` - Add environment variables and system info
- `CoreSystemPromptModifier` - Handle core system prompt
- `DirectoryContextModifier` - Add working directory context
- `IdeContextModifier` - Add IDE integration context
- `AtFileProcessorModifier` - Process @file references
- `ArgumentProcessorModifier` - Process command arguments
- `MemoryImportModifier` - Import memory/context from previous sessions
- `ToolInjectionModifier` - Inject tool descriptions into prompts
- `ChatRecordingModifier` - Record chat for persistence
- `ChatHistoryMessageModifier` - Include conversation history

### PreInference Processors
Run before LLM calls:
- `ChatCompressionModifier` - Compress chat history to save tokens

### PostInference Processors
Run after LLM calls:
- `LoopDetectionModifier` - Detect and prevent infinite loops

### PreToolCall Processors
Validate and modify tool calls before execution:
- `ToolParameterModifier` - Transform tool parameters
- `ToolValidationModifier` - Validate tool inputs

### PostToolCall Processors
Process tool results:
- `ConversationCompactorModifier` - Compact long conversations
- `ShellProcessorModifier` - Process shell command results

## Debugging

```typescript
import { ChatRecordingModifier } from '@codebolt/agent/processor-pieces';

const debugAgent = new CodeboltAgent({
  instructions: 'You are a debug agent.',
  tools: [myTools],

  messageModifiers: [
    new ChatRecordingModifier({
      enabled: true,
      outputPath: './agent-logs'
    })
  ]
});
```
