---
name: codebolt-agent-development
description: Build AI agents for the Codebolt platform using @codebolt/agent. Use when creating agents, configuring the agent loop, writing custom message modifiers, implementing processors, creating tools, building workflows, or choosing between abstraction levels. Covers Level 1 (direct APIs), Level 2 (base components), and Level 3 (high-level CodeboltAgent).
---

# Codebolt Agent Development

## Architecture Overview

Codebolt provides a **3-tier architecture** for building AI agents:

```
┌─────────────────────────────────────────────────────────────────┐
│  LEVEL 3: High-Level Abstractions                               │
│  CodeboltAgent, Agent, Workflow, Tools                          │
│  → Use when: You want a ready-to-use agent with minimal setup   │
├─────────────────────────────────────────────────────────────────┤
│  LEVEL 2: Base Components                                       │
│  InitialPromptGenerator, AgentStep, ResponseExecutor            │
│  → Use when: You need control over the agent loop               │
├─────────────────────────────────────────────────────────────────┤
│  LEVEL 1: Direct APIs                                           │
│  codebolt.llm, codebolt.fs, codebolt.terminal, etc.            │
│  → Use when: You want to build everything from scratch          │
└─────────────────────────────────────────────────────────────────┘
```

## Choosing the Right Level

| Need | Level | What to Use |
|------|-------|-------------|
| Quick agent with defaults | Level 3 | `CodeboltAgent` |
| Custom agent loop logic | Level 2 | `InitialPromptGenerator` + `AgentStep` + `ResponseExecutor` |
| Full manual control | Level 1 | Direct `codebolt.*` APIs |
| Multi-step orchestration | Level 3 | `Workflow` with steps |
| Custom tools | Level 3 | `createTool()` with Zod schemas |
| Custom context injection | Any | Extend `BaseMessageModifier` |

## Level 1: Direct APIs

For building agents manually without any framework.

**Use the existing skills:**
- **`codebolt-api-access`** - TypeScript SDK calls (`codebolt.fs`, `codebolt.llm`, etc.)
- **`codebolt-mcp-access`** - MCP tool execution (`codebolt.tools.executeTool`)

**Manual agent loop pattern:**
```typescript
import codebolt from '@codebolt/codeboltjs';

codebolt.onMessage(async (userMessage) => {
  // 1. Build messages array
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: userMessage.userMessage }
  ];

  // 2. Call LLM
  const response = await codebolt.llm.inference({ messages, tools: [...] });

  // 3. Handle tool calls manually
  if (response.completion.choices[0].message.tool_calls) {
    for (const toolCall of response.completion.choices[0].message.tool_calls) {
      const result = await codebolt.mcp.executeTool(
        toolCall.function.name.split('--')[0],
        toolCall.function.name.split('--')[1],
        JSON.parse(toolCall.function.arguments)
      );
      // Add result to messages and loop...
    }
  }

  // 4. Send response
  codebolt.chat.sendMessage(response.completion.choices[0].message.content);
});
```

**See:** [references/level1-direct-apis.md](references/level1-direct-apis.md)

## Level 2: Base Components

For custom agent loop with helper functions.

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import { ChatHistoryMessageModifier, CoreSystemPromptModifier } from '@codebolt/agent/processor-pieces';

// 1. Setup message processor
const promptGenerator = new InitialPromptGenerator({
  processors: [
    new ChatHistoryMessageModifier(),
    new CoreSystemPromptModifier({ customSystemPrompt: 'You are helpful.' })
  ]
});

// 2. Setup inference step
const agentStep = new AgentStep({
  preInferenceProcessors: [],
  postInferenceProcessors: []
});

// 3. Setup tool executor
const responseExecutor = new ResponseExecutor({
  preToolCallProcessors: [],
  postToolCallProcessors: []
});

// 4. Custom loop
let prompt = await promptGenerator.processMessage(userMessage);
while (!completed) {
  const stepResult = await agentStep.executeStep(userMessage, prompt);
  const execResult = await responseExecutor.executeResponse({
    nextMessage: stepResult.nextMessage,
    rawLLMOutput: stepResult.rawLLMResponse,
    actualMessageSentToLLM: stepResult.actualMessageSentToLLM
  });
  completed = execResult.completed;
  prompt = execResult.nextMessage;
}
```

**See:** [references/level2-base-components.md](references/level2-base-components.md)

## Level 3: High-Level Abstractions

For production-ready agents with minimal setup.

### CodeboltAgent (Recommended)

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

const agent = new CodeboltAgent({
  instructions: 'You are a coding assistant.',
  enableLogging: true
});

const result = await agent.processMessage({
  userMessage: 'Help me write a function',
  threadId: 'thread-123',
  messageId: 'msg-456'
});
```

### With Custom Processors

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
      new CoreSystemPromptModifier({ customSystemPrompt: 'Custom prompt...' }),
      new ChatHistoryMessageModifier({ maxHistoryMessages: 10 }),
      new ToolInjectionModifier({ toolsLocation: 'Tool' }),
      new IdeContextModifier({ includeActiveFile: true })
    ],
    preInferenceProcessors: [],
    postInferenceProcessors: [],
    preToolCallProcessors: [],
    postToolCallProcessors: []
  }
});
```

**See:** [references/level3-high-level.md](references/level3-high-level.md)

## Creating Custom Tools

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const searchTool = createTool({
  id: 'search-files',
  description: 'Search for files matching a pattern',
  inputSchema: z.object({
    pattern: z.string().describe('Glob pattern'),
    directory: z.string().optional()
  }),
  execute: async ({ input }) => {
    return { files: ['file1.ts', 'file2.ts'] };
  }
});
```

**See:** [references/tools.md](references/tools.md)

## Creating Custom Modifiers & Processors

Extend base classes to inject custom behavior:

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';

class MyModifier extends BaseMessageModifier {
  async modify(originalRequest, createdMessage) {
    createdMessage.message.messages.push({
      role: 'system',
      content: 'Custom context here'
    });
    return createdMessage;
  }
}
```

**See:** [references/processors.md](references/processors.md)

## Building Workflows

```typescript
import { Workflow } from '@codebolt/agent/unified';

const workflow = new Workflow({
  name: 'Code Review',
  steps: [
    { id: 'lint', execute: async (ctx) => ({ success: true, data: {} }) },
    { id: 'test', execute: async (ctx) => ({ success: true, data: {} }) }
  ]
});

const result = await workflow.executeAsync();
```

**See:** [references/workflows.md](references/workflows.md)

## Key Imports

```typescript
// Level 3 - High-level
import { CodeboltAgent, Agent, Workflow, createTool } from '@codebolt/agent/unified';

// Level 2 - Base components
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';

// Processors & Modifiers
import {
  BaseMessageModifier,
  CoreSystemPromptModifier,
  ChatHistoryMessageModifier,
  ToolInjectionModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  BasePreInferenceProcessor,
  BasePostInferenceProcessor,
  BasePreToolCallProcessor,
  BasePostToolCallProcessor
} from '@codebolt/agent/processor-pieces';

// Level 1 - Direct APIs
import codebolt from '@codebolt/codeboltjs';
```

## References

| Topic | File |
|-------|------|
| Level 1: Direct APIs | [references/level1-direct-apis.md](references/level1-direct-apis.md) |
| Level 2: Base Components | [references/level2-base-components.md](references/level2-base-components.md) |
| Level 3: High-Level | [references/level3-high-level.md](references/level3-high-level.md) |
| Tools | [references/tools.md](references/tools.md) |
| Processors & Modifiers | [references/processors.md](references/processors.md) |
| Workflows | [references/workflows.md](references/workflows.md) |
| Examples | [references/examples.md](references/examples.md) |

## Related Skills

- **codebolt-api-access** - Direct TypeScript SDK APIs
- **codebolt-mcp-access** - MCP tool execution
