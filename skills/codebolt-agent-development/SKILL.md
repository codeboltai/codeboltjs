---
name: codebolt-agent-development
description: Build AI agents for the Codebolt platform using @codebolt/agent. Use when creating agents, configuring the agent loop, writing custom message modifiers, implementing processors, creating tools, building workflows, ActionBlocks, or choosing between abstraction levels. Covers Remix Agents (no-code), Level 1 (direct APIs), Level 2 (base components), Level 3 (high-level CodeboltAgent), and ActionBlocks for reusable logic.
---

# Codebolt Agent Development

## Architecture Overview

Codebolt provides a **4-tier architecture** for building AI agents:

```
┌─────────────────────────────────────────────────────────────────┐
│  REMIX AGENTS: No-Code Configuration                            │
│  Markdown files with YAML frontmatter + custom instructions     │
│  → Use when: You want agents without writing any code           │
├─────────────────────────────────────────────────────────────────┤
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
         ↑↓ Mix & Match ↑↓
┌─────────────────────────────────────────────────────────────────┐
│  ActionBlocks: Reusable logic units invoked from any level      │
└─────────────────────────────────────────────────────────────────┘
```

## Remix Agents (No-Code)

Remix Agents let you create agents **without writing any code**. They're stored as markdown files with YAML frontmatter in `.codebolt/agents/remix/`.

### File Format

```markdown
---
name: my-code-reviewer
description: A specialized code review agent
model: claude-sonnet-4-20250514
provider: anthropic
tools:
  - codebolt--readFile
  - codebolt--writeFile
  - codebolt--search
maxSteps: 100
reasoningEffort: medium
skills:
  - code-review
remixedFromId: base-coding-agent
remixedFromTitle: Base Coding Agent
version: 1.0.0
---

# Custom Instructions

You are a code review specialist. When reviewing code:

1. Check for security vulnerabilities
2. Identify performance issues
3. Suggest improvements
4. Note style inconsistencies

Always provide constructive feedback with examples.
```

### MarkdownAgent Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Agent identifier (becomes filename) |
| `description` | string | Brief description |
| `model` | string | Model to use (e.g., "claude-sonnet-4-20250514") |
| `provider` | string | Provider name (e.g., "anthropic", "openai") |
| `tools` | string[] | Tools available to the agent |
| `maxSteps` | number | Max agentic iterations |
| `reasoningEffort` | 'low' \| 'medium' \| 'high' | For reasoning models |
| `skills` | string[] | Skills to auto-load |
| `remixedFromId` | string | Original agent ID (when remixing) |
| `additionalSubAgent` | any[] | Sub-agents to include |

### When to Use Remix Agents

- Quick customization of existing agents
- Non-developers creating agents
- Prototyping before building full code agents
- Sharing agents as portable markdown files
- Compatible with external tools (OpenCode, Factory.ai, Claude Code)

**See:** [references/remix-agents.md](references/remix-agents.md)

## Mixing and Matching Levels

**Levels are NOT exclusive.** You can combine them based on your needs:

```typescript
// Example: Level 3 agent + Level 1 direct API calls outside the loop
import { CodeboltAgent } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';

codebolt.onMessage(async (msg) => {
  // Level 1: Send initial status message
  codebolt.chat.sendMessage('Starting analysis...');

  // Level 1: Do pre-processing with direct APIs
  const files = await codebolt.fs.listFile('./src', true);

  // Level 3: Use high-level agent for the main work
  const agent = new CodeboltAgent({ instructions: 'You are a code reviewer.' });
  const result = await agent.processMessage(msg);

  // Level 1: Post-processing with direct APIs
  await codebolt.memory.json.save({ review: result, files: files.data });
  codebolt.chat.sendMessage('Review complete and saved!');
});
```

**Common mixing patterns:**

| Pattern | Description |
|---------|-------------|
| Level 3 + Level 1 outside loop | Use CodeboltAgent but add direct API calls before/after |
| Level 2 + custom loop logic | Use base components but add custom iteration control |
| Level 3 + ActionBlocks | Use CodeboltAgent with ActionBlocks for reusable subtasks |
| Workflow + ActionBlocks | Workflow steps that invoke ActionBlocks |

## The Agent Loop Pattern

Codebolt agents follow a standard execution pattern:

```
┌────────────────────────────────────────────────────────────────┐
│  1. onMessage() receives user message                          │
│  2. Process into initial prompt (attach context, tools, etc.)  │
│  3. AGENT LOOP:                                                │
│     ├─► Send prompt to LLM                                     │
│     ├─► Get response (may include tool_calls)                  │
│     ├─► If tool_calls: execute tools, add results to prompt    │
│     ├─► Check for async events (child agents, completions)     │
│     └─► Repeat until no tool_calls AND no pending events       │
│  4. Return final response                                      │
└────────────────────────────────────────────────────────────────┘
```

### Basic Pattern

```typescript
codebolt.onMessage(async (reqMessage) => {
  // 1. Process message into prompt
  let prompt = await promptGenerator.processMessage(reqMessage);

  // 2. Agent loop
  let completed = false;
  while (!completed) {
    const stepResult = await agentStep.executeStep(reqMessage, prompt);
    const execResult = await responseExecutor.executeResponse({...});

    completed = execResult.completed;
    prompt = execResult.nextMessage;
  }

  return execResult.finalMessage;
});
```

### With Async Event Handling (Orchestrator Pattern)

```typescript
const eventQueue = codebolt.agentEventQueue;
const agentTracker = codebolt.backgroundChildThreads;

codebolt.onMessage(async (reqMessage) => {
  let prompt = await promptGenerator.processMessage(reqMessage);
  let continueLoop = true;

  do {
    // Run agent loop until no tool calls
    const result = await runAgentLoop(reqMessage, prompt);
    prompt = result.prompt;

    // Check for events from child agents
    if (agentTracker.getRunningAgentCount() > 0 ||
        eventQueue.getPendingExternalEventCount() > 0) {
      const events = await eventQueue.getPendingQueueEvents();
      // Process events, add to prompt
      continueLoop = true;
    } else {
      continueLoop = false;
    }
  } while (continueLoop);
});
```

### Long-Running Orchestrator (Never Exits)

```typescript
// For orchestrators that wait for child agents indefinitely
while (true) {
  const event = await eventQueue.waitForAnyExternalEvent();
  // Process event...
}
```

**See:** [references/level2-base-components.md](references/level2-base-components.md) for full details.

## ActionBlocks

ActionBlocks are **reusable, independently executable units** of logic that can be invoked from agents, workflows, or other ActionBlocks.

### When to Use ActionBlocks

- Extract complex logic into reusable components
- Share functionality across multiple agents
- Create modular, testable units of work
- Build orchestration pipelines with Workflows

### Quick Start

```typescript
// Invoke an ActionBlock
const result = await codebolt.actionBlock.start('create-plan-for-given-task', {
  userMessage: reqMessage
});

if (result.success) {
  console.log('Plan created:', result.result.planId);
}
```

### Creating an ActionBlock

```typescript
// src/index.ts
import codebolt from '@codebolt/codeboltjs';

codebolt.onActionBlockInvocation(async (threadContext, metadata) => {
  const params = threadContext?.params || {};
  const { task, options } = params;

  // Validate
  if (!task) {
    return { success: false, error: 'task is required' };
  }

  // Send status
  codebolt.chat.sendMessage(`Processing: ${task.name}`);

  // Do work
  const result = await processTask(task, options);

  // Return structured result
  return { success: true, data: result };
});
```

### ActionBlocks + Workflows

```typescript
import { Workflow } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';

const orchestrationWorkflow = new Workflow({
  name: 'Task Orchestration',
  steps: [
    {
      id: 'create-plan',
      execute: async (ctx) => {
        const result = await codebolt.actionBlock.start('create-plan-for-given-task', {
          userMessage: ctx.userMessage
        });
        return { success: result.success, data: { planId: result.result?.planId } };
      }
    },
    {
      id: 'create-jobs',
      execute: async (ctx) => {
        const result = await codebolt.actionBlock.start('create-jobs-from-plan', {
          planId: ctx.planId
        });
        return { success: result.success, data: { jobs: result.result?.jobs } };
      }
    }
  ]
});
```

**See:** [references/action-blocks.md](references/action-blocks.md)

## Choosing the Right Level

| Need | Level | What to Use |
|------|-------|-------------|
| No-code agent creation | Remix | Markdown file with YAML frontmatter |
| Quick agent with defaults | Level 3 | `CodeboltAgent` |
| Custom agent loop logic | Level 2 | `InitialPromptGenerator` + `AgentStep` + `ResponseExecutor` |
| Full manual control | Level 1 | Direct `codebolt.*` APIs |
| Multi-step orchestration | Level 3 | `Workflow` with steps |
| Orchestrator with child agents | Level 2 | Agent loop + `agentEventQueue` |
| Long-running orchestrator | Level 2 | `waitForAnyExternalEvent()` loop |
| Reusable logic units | ActionBlocks | `codebolt.actionBlock.start()` |
| Tools for single agent | Level 3 | `createTool()` with Zod schemas |
| Shared tools across agents | MCP | `MCPServer` from `@codebolt/mcp` |
| Custom context injection | Any | Extend `BaseMessageModifier` |

## Level 1: Direct APIs

For building agents manually without any framework.

**Use the existing skills:**
- **`codebolt-api-access`** - TypeScript SDK calls (`codebolt.fs`, `codebolt.llm`, etc.)
- **`codebolt-mcp-access`** - MCP tool execution (`codebolt.tools.executeTool`)

**See:** [references/level1-direct-apis.md](references/level1-direct-apis.md)

## Level 2: Base Components

For custom agent loop with helper functions.

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import { ChatHistoryMessageModifier, CoreSystemPromptModifier } from '@codebolt/agent/processor-pieces';

const promptGenerator = new InitialPromptGenerator({
  processors: [new ChatHistoryMessageModifier(), new CoreSystemPromptModifier()]
});
const agentStep = new AgentStep({});
const responseExecutor = new ResponseExecutor({});

let prompt = await promptGenerator.processMessage(userMessage);
while (!completed) {
  const stepResult = await agentStep.executeStep(userMessage, prompt);
  const execResult = await responseExecutor.executeResponse({...});
  completed = execResult.completed;
  prompt = execResult.nextMessage;
}
```

**See:** [references/level2-base-components.md](references/level2-base-components.md)

## Level 3: High-Level Abstractions

For production-ready agents with minimal setup.

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

**See:** [references/level3-high-level.md](references/level3-high-level.md)

## Creating Custom Tools

Two approaches for adding custom tools:

| Approach | Package | Use Case |
|----------|---------|----------|
| **Local Tools** | `@codebolt/agent` | Tools used within your agent code |
| **MCP Servers** | `@codebolt/mcp` | Standalone tool servers, shared across agents |

### Local Tools (Quick)

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const searchTool = createTool({
  id: 'search-files',
  description: 'Search for files matching a pattern',
  inputSchema: z.object({ pattern: z.string(), directory: z.string().optional() }),
  execute: async ({ input }) => ({ files: ['file1.ts', 'file2.ts'] })
});
```

### Custom MCP Servers (Shared)

```typescript
import { MCPServer } from '@codebolt/mcp';
import { z } from 'zod';

const server = new MCPServer({ name: 'my-tools', version: '1.0.0' });

server.addTool({
  name: 'greet',
  description: 'Greet someone',
  parameters: z.object({ name: z.string() }),
  execute: async (args) => `Hello, ${args.name}!`
});

await server.start({ transportType: 'stdio' });
```

**See:** [references/tools.md](references/tools.md)

## Creating Custom Modifiers & Processors

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';

class MyModifier extends BaseMessageModifier {
  async modify(originalRequest, createdMessage) {
    createdMessage.message.messages.push({ role: 'system', content: 'Custom context' });
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
  BaseMessageModifier, CoreSystemPromptModifier, ChatHistoryMessageModifier,
  ToolInjectionModifier, EnvironmentContextModifier, DirectoryContextModifier,
  IdeContextModifier, BasePreInferenceProcessor, BasePostInferenceProcessor,
  BasePreToolCallProcessor, BasePostToolCallProcessor
} from '@codebolt/agent/processor-pieces';

// Custom MCP Servers
import { MCPServer } from '@codebolt/mcp';

// Level 1 - Direct APIs, ActionBlocks & Event Queue
import codebolt from '@codebolt/codeboltjs';
// codebolt.actionBlock.start(), codebolt.actionBlock.list()
// codebolt.agentEventQueue.getPendingQueueEvents()
// codebolt.agentEventQueue.waitForAnyExternalEvent()
// codebolt.backgroundChildThreads.getRunningAgentCount()
```

## References

| Topic | File |
|-------|------|
| Remix Agents (No-Code) | [references/remix-agents.md](references/remix-agents.md) |
| Mixing & Matching Levels | This file (above) |
| Level 1: Direct APIs | [references/level1-direct-apis.md](references/level1-direct-apis.md) |
| Level 2: Base Components | [references/level2-base-components.md](references/level2-base-components.md) |
| Level 3: High-Level | [references/level3-high-level.md](references/level3-high-level.md) |
| ActionBlocks | [references/action-blocks.md](references/action-blocks.md) |
| Tools | [references/tools.md](references/tools.md) |
| Processors & Modifiers | [references/processors.md](references/processors.md) |
| Workflows | [references/workflows.md](references/workflows.md) |
| Examples | [references/examples.md](references/examples.md) |

## Related Skills

- **codebolt-api-access** - Direct TypeScript SDK APIs
- **codebolt-mcp-access** - MCP tool execution
