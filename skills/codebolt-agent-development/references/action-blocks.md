# ActionBlocks

Reusable, independently executable units of logic for modular agent development.

---

## What is an ActionBlock?

An ActionBlock is a self-contained package that:
- Executes independently via WebSocket messages
- Can be invoked from agents, workflows, or other ActionBlocks
- Returns structured results back to the caller
- Handles specific, well-defined tasks

**Types:**
- `FILESYSTEM` - Located in the file system (`/action-blocks/`)
- `RUNTIME` - Dynamically created at runtime
- `BUILTIN` - Built-in system ActionBlocks

---

## ActionBlock API

### List ActionBlocks

```typescript
// List all available ActionBlocks
const response = await codebolt.actionBlock.list();

// Filter by type
const response = await codebolt.actionBlock.list({ type: 'filesystem' });
```

### Get ActionBlock Details

```typescript
const detail = await codebolt.actionBlock.getDetail('create-plan-for-given-task');
// Returns: name, description, version, inputs, outputs, metadata
```

### Start/Invoke an ActionBlock

```typescript
const result = await codebolt.actionBlock.start('my-action-block', {
  param1: 'value1',
  param2: { nested: 'data' }
});

// Response structure (generic for type safety)
interface StartActionBlockResponse<T = unknown> {
  type: 'startActionBlockResponse';
  success: boolean;
  sideExecutionId?: string;  // Execution tracking ID
  result?: T;                // ActionBlock return value
  error?: string;
  requestId?: string;
}
```

---

## Creating an ActionBlock

### Directory Structure

```
/action-blocks/my-action-block/
├── src/
│   ├── index.ts           # Main handler
│   └── types.ts           # Input/output types
├── dist/                  # Compiled output (generated)
├── actionblock.yml        # Configuration
├── package.json
├── tsconfig.json
└── webpack.config.js
```

### Implementation Pattern

```typescript
// src/index.ts
import codebolt from '@codebolt/codeboltjs';
import { MyInput, MyResult } from './types';

// Type definitions for ActionBlock invocation (define in your types.ts)
interface ThreadContext {
  params?: Record<string, unknown>;
  threadId?: string;
  messageId?: string;
  [key: string]: unknown;
}

interface ActionBlockInvocationMetadata {
  sideExecutionId: string;
  threadId: string;
  parentAgentId: string;
  parentAgentInstanceId: string;
  timestamp: string;
}

codebolt.onActionBlockInvocation(async (threadContext: ThreadContext, metadata: ActionBlockInvocationMetadata): Promise<MyResult> => {
  try {
    // 1. Extract parameters
    const params = threadContext?.params || {};
    const { task, options } = params as MyInput;

    // 2. Validate inputs
    if (!task) {
      return { success: false, error: 'task is required' };
    }

    // 3. Send status messages (optional)
    codebolt.chat.sendMessage(`Processing task: ${task.name}`);

    // 4. Perform work
    const result = await doWork(task, options);

    // 5. Return structured result
    return {
      success: true,
      data: result,
      taskId: task.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

export * from './types';
```

### Define Types

```typescript
// src/types.ts
export interface MyInput {
  task: {
    id: string;
    name: string;
    description: string;
  };
  options?: {
    maxRetries?: number;
    timeout?: number;
  };
}

export interface MyResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  taskId?: string;
}
```

### Configuration (actionblock.yml)

```yaml
name: my-action-block
description: Describes what this ActionBlock does
version: 1.0.0
entryPoint: dist/index.js

metadata:
  author: Your Name
  tags:
    - category
    - feature
  dependencies:
    - "@codebolt/codeboltjs"

  inputs:
    - name: task
      type: object
      required: true
      description: The task to process

    - name: options
      type: object
      required: false
      description: Optional configuration

  outputs:
    - name: success
      type: boolean
      description: Whether the operation succeeded
    - name: data
      type: any
      description: The result data
    - name: error
      type: string
      description: Error message if failed
```

### Package Configuration

```json
{
  "name": "@codebolt/my-action-block",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "npx webpack",
    "dev": "npx tsx src/index.ts"
  },
  "dependencies": {
    "@codebolt/codeboltjs": "workspace:*",
    "@codebolt/types": "workspace:*"
  }
}
```

### Build

```bash
npm run build  # Creates dist/index.js
```

---

## Metadata Access

ActionBlocks receive context and metadata. Define these types in your project:

```typescript
// Type definitions (add to your types.ts)
interface ThreadContext {
  params?: Record<string, unknown>;  // Parameters passed via start()
  threadId?: string;
  messageId?: string;
  [key: string]: unknown;            // Additional context data
}

interface ActionBlockInvocationMetadata {
  sideExecutionId: string;           // Unique execution ID
  threadId: string;                  // Parent thread ID
  parentAgentId: string;             // Calling agent ID
  parentAgentInstanceId: string;     // Calling agent instance
  timestamp: string;                 // Execution timestamp
}

// Usage
codebolt.onActionBlockInvocation(async (threadContext: ThreadContext, metadata: ActionBlockInvocationMetadata) => {
  const params = threadContext?.params || {};
  const executionId = metadata.sideExecutionId;
  // ...
});
```

---

## Sample ActionBlocks

### break-task-into-jobs

Decomposes a task into smaller sub-jobs using LLM analysis.

```typescript
const result = await codebolt.actionBlock.start('break-task-into-jobs', {
  plan: { planId: 'plan-123', name: 'Project Plan' },
  task: { taskId: 'task-456', name: 'Implement feature' },
  existingJobs: []
});

// Returns: { success, taskId, subJobs[], subJobCount }
```

### create-plan-for-given-task

Creates a comprehensive implementation plan with two phases:
1. Detail Planner - Creates detailed spec using agent
2. Task Planner - Parses spec to create task plan

```typescript
const result = await codebolt.actionBlock.start('create-plan-for-given-task', {
  userMessage: reqMessage
});

// Returns: { success, planId, requirementPlanPath, tasks[] }
```

### create-jobs-from-plan

Generates detailed job specifications for tasks in a plan.

```typescript
const result = await codebolt.actionBlock.start('create-jobs-from-plan', {
  plan: { planId, name, description, tasks },
  task: { taskId, name, description, priority, dependencies },
  groupId: 'job-group-123',
  workerAgentId: 'agent-456'
});

// Returns: { success, jobId, groupId }
```

### find-next-job-for-agent

Finds the next available job using pheromone-based selection.

```typescript
const result = await codebolt.actionBlock.start('find-next-job-for-agent', {
  swarmId: 'swarm-123',
  agentId: 'agent-456'
});

// Returns: { success, job, recommendedAction: 'implement' | 'split' | 'terminate' }
```

### create-team-for-swarm

Handles team formation for swarm agents.

```typescript
const result = await codebolt.actionBlock.start('create-team-for-swarm', {
  swarmId: 'swarm-123',
  agentId: 'agent-456'
});

// Returns: { success, teamId, action: 'created' | 'joined' }
```

---

## ActionBlocks with Workflows

Combine ActionBlocks with Workflows for orchestration:

```typescript
import { Workflow } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';

const orchestrationWorkflow = new Workflow({
  name: 'Task Orchestration Pipeline',
  steps: [
    {
      id: 'create-plan',
      execute: async (ctx) => {
        const result = await codebolt.actionBlock.start('create-plan-for-given-task', {
          userMessage: ctx.userMessage
        });
        if (!result.success) {
          return { success: false, error: result.error };
        }
        return { success: true, data: { planId: result.result.planId } };
      }
    },
    {
      id: 'break-into-jobs',
      execute: async (ctx) => {
        const planDetails = await getPlanDetails(ctx.planId);
        const allJobs = [];

        for (const task of planDetails.tasks) {
          const result = await codebolt.actionBlock.start('break-task-into-jobs', {
            plan: planDetails,
            task: task
          });
          if (result.success) {
            allJobs.push(...result.result.subJobs);
          }
        }

        return { success: true, data: { jobs: allJobs } };
      }
    },
    {
      id: 'create-job-records',
      execute: async (ctx) => {
        for (const job of ctx.jobs) {
          await codebolt.actionBlock.start('create-jobs-from-plan', {
            plan: ctx.plan,
            task: job,
            groupId: ctx.groupId
          });
        }
        return { success: true };
      }
    }
  ]
});
```

---

## ActionBlocks with Agents

Use ActionBlocks within agent logic:

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';

codebolt.onMessage(async (msg) => {
  // Phase 1: Use ActionBlock to create plan
  const planResult = await codebolt.actionBlock.start('create-plan-for-given-task', {
    userMessage: msg
  });

  if (planResult.success && planResult.result?.planId) {
    // Phase 2: Process plan with jobs
    await processJobs(planResult.result.planId);
  } else {
    // Fallback: Use agent directly
    const agent = new CodeboltAgent({
      instructions: 'You are a helpful assistant.'
    });
    await agent.processMessage(msg);
  }
});
```

---

## ActionBlocks Using Agent Components

ActionBlocks can use Level 2/3 components internally:

```typescript
// Inside an ActionBlock
import codebolt from '@codebolt/codeboltjs';
import { InitialPromptGenerator, AgentStep } from '@codebolt/agent/unified';
import { ChatHistoryMessageModifier, EnvironmentContextModifier } from '@codebolt/agent/processor-pieces';

codebolt.onActionBlockInvocation(async (threadContext, metadata) => {
  const { userMessage } = threadContext.params;

  // Use Level 2 components inside ActionBlock
  const promptGenerator = new InitialPromptGenerator({
    processors: [
      new ChatHistoryMessageModifier(),
      new EnvironmentContextModifier()
    ]
  });

  const agentStep = new AgentStep({});
  const prompt = await promptGenerator.processMessage(userMessage);
  const result = await agentStep.executeStep(userMessage, prompt);

  // Parse and return structured result
  const content = result.rawLLMResponse.choices[0].message.content;
  const parsed = parseContent(content);

  return { success: true, data: parsed };
});
```

---

## Best Practices

### 1. Always Validate Inputs

```typescript
if (!params.task || !params.task.id) {
  return { success: false, error: 'task with id is required' };
}
```

### 2. Return Structured Results

```typescript
// Always include success flag
return { success: true, data: result };
return { success: false, error: 'descriptive message' };
```

### 3. Send Status Messages for Long Operations

```typescript
codebolt.chat.sendMessage(`Processing ${items.length} items...`);
```

### 4. Handle Both Params Locations

```typescript
// params might be in different locations
const params = threadContext?.params || threadContext || {};
```

### 5. Use Metadata for Context

```typescript
const executionId = metadata.sideExecutionId;
const callingAgentId = metadata.parentAgentInstanceId;
```

### 6. Define Types Separately

```typescript
// types.ts - export for consumers
export interface MyInput { ... }
export interface MyResult { ... }
```

### 7. Document in actionblock.yml

Include comprehensive input/output documentation for discoverability.

---

## Error Handling

```typescript
codebolt.onActionBlockInvocation(async (threadContext, metadata) => {
  try {
    // Main logic
    return { success: true, data: result };
  } catch (error) {
    // Log for debugging
    console.error('ActionBlock error:', error);

    // Return structured error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error.code || 'UNKNOWN'
    };
  }
});
```

---

## LLM Tools for ActionBlocks

ActionBlocks are exposed as tools that LLMs can invoke:

| Tool | Description |
|------|-------------|
| `actionBlock_list` | Lists available ActionBlocks |
| `actionBlock_getDetail` | Gets ActionBlock details |
| `actionBlock_start` | Starts an ActionBlock with parameters |

```typescript
// LLM can call these tools to discover and invoke ActionBlocks
const tools = [
  {
    name: 'actionBlock_start',
    description: 'Start an ActionBlock',
    parameters: {
      actionBlockName: { type: 'string', required: true },
      params: { type: 'object', required: false }
    }
  }
];
```
