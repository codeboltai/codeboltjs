# Examples

Comprehensive examples for each abstraction level.

---

## ⚠️ ActionBlock Invocation Pattern (READ FIRST)

**When writing agents, ALWAYS invoke existing ActionBlocks instead of implementing their logic inline.**

### ❌ WRONG: Inline Action Block Logic

```typescript
// DON'T DO THIS - implementing action block logic directly in the agent
import codebolt from '@codebolt/codeboltjs';
import { InitialPromptGenerator, AgentStep } from '@codebolt/agent/unified';
import type { FlatUserMessage } from '@codebolt/types/sdk';

codebolt.onMessage(async (msg: FlatUserMessage): Promise<void> => {
  // BAD: Implementing planning logic inline
  const promptGenerator = new InitialPromptGenerator({...});
  const agentStep = new AgentStep({});

  // ... 50+ lines of planning implementation ...
  const planPrompt = await promptGenerator.processMessage(msg);
  const planResult = await agentStep.executeStep(msg, planPrompt);
  const plan = parsePlanFromResponse(planResult);

  // BAD: Implementing job creation inline
  const jobs = [];
  for (const task of plan.tasks) {
    // ... 30+ lines of job creation logic ...
    const jobPrompt = await createJobPrompt(task);
    const jobResult = await agentStep.executeStep(msg, jobPrompt);
    jobs.push(parseJobFromResponse(jobResult));
  }
});
```

### ✅ CORRECT: Invoke Existing ActionBlocks

```typescript
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';

codebolt.onMessage(async (msg: FlatUserMessage) => {
  // GOOD: Invoke the planning ActionBlock
  const planResult = await codebolt.actionBlock.start('create-plan-for-given-task', {
    userMessage: msg
  });

  if (!planResult.success) {
    codebolt.chat.sendMessage(`Planning failed: ${planResult.error}`);
    return;
  }

  // GOOD: Invoke the job creation ActionBlock
  const jobsResult = await codebolt.actionBlock.start('break-task-into-jobs', {
    plan: planResult.result,
    task: planResult.result.tasks[0]
  });

  if (jobsResult.success) {
    codebolt.chat.sendMessage(`Created ${jobsResult.result.subJobCount} jobs`);
  }
});
```

### Discovering Available ActionBlocks

```typescript
// List all ActionBlocks to find what's available
const available = await codebolt.actionBlock.list();
console.log('Available ActionBlocks:', available.data.map((b: { name: string }) => b.name));

// Get details about a specific ActionBlock before using it
const detail = await codebolt.actionBlock.getDetail('create-plan-for-given-task');
console.log('Inputs:', detail.metadata.inputs);
console.log('Outputs:', detail.metadata.outputs);
```

---

## Complete Agent Example with Loop (Level 2)

This is a **reference implementation** showing a complete agent with the proper loop pattern. When you need complex logic (planning, job creation, etc.), **invoke ActionBlocks instead of implementing inline**.

```typescript
import codebolt from '@codebolt/codeboltjs';
import {
  InitialPromptGenerator,
  ResponseExecutor,
  AgentStep
} from '@codebolt/agent/unified';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentStepOutput, ProcessedMessage, ResponseExecutorResult } from '@codebolt/types/agent';
import {
  EnvironmentContextModifier,
  CoreSystemPromptModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  AtFileProcessorModifier,
  ToolInjectionModifier,
  ChatHistoryMessageModifier
} from '@codebolt/agent/processor-pieces';

// Define your system prompt
const systemPrompt: string = `
You are a helpful coding assistant. Help users with:
- Writing and debugging code
- Explaining concepts
- Refactoring suggestions

Always explain your reasoning before making changes.
`.trim();

codebolt.onMessage(async (reqMessage: FlatUserMessage): Promise<void> => {
  try {
    codebolt.chat.sendMessage('Agent started processing your request...');

    // Initialize the prompt generator with all modifiers
    const promptGenerator: InitialPromptGenerator = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new EnvironmentContextModifier({ enableFullContext: true }),
        new DirectoryContextModifier(),
        new IdeContextModifier({
          includeActiveFile: true,
          includeOpenFiles: true,
          includeCursorPosition: true,
          includeSelectedText: true
        }),
        new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
        new ToolInjectionModifier({ includeToolDescriptions: true }),
        new AtFileProcessorModifier({ enableRecursiveSearch: true })
      ],
      baseSystemPrompt: systemPrompt
    });

    // Process the initial message
    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);

    // Agent loop
    let completed: boolean = false;
    do {
      // Execute a single agent step (LLM inference)
      const agent: AgentStep = new AgentStep({
        preInferenceProcessors: [],
        postInferenceProcessors: []
      });
      const result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);
      prompt = result.nextMessage;

      // Execute the response (tool calls, completion check)
      const responseExecutor: ResponseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: []
      });
      const executionResult: ResponseExecutorResult = await responseExecutor.executeResponse({
        initialUserMessage: reqMessage,
        actualMessageSentToLLM: result.actualMessageSentToLLM,
        rawLLMOutput: result.rawLLMResponse,
        nextMessage: result.nextMessage
      });

      completed = executionResult.completed;
      prompt = executionResult.nextMessage;

      if (completed) {
        break;
      }
    } while (!completed);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    codebolt.chat.sendMessage(`Error: ${errorMessage}`);
  }
});
```

---

## Complete Agent with ActionBlock Invocation (Recommended Pattern)

This example shows **the recommended pattern**: use the agent loop for orchestration, but **invoke ActionBlocks** for complex logic instead of implementing it inline.

```typescript
import codebolt from '@codebolt/codeboltjs';
import {
  InitialPromptGenerator,
  ResponseExecutor,
  AgentStep
} from '@codebolt/agent/unified';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentStepOutput, ProcessedMessage, ResponseExecutorResult } from '@codebolt/types/agent';
import {
  CoreSystemPromptModifier,
  ToolInjectionModifier,
  ChatHistoryMessageModifier
} from '@codebolt/agent/processor-pieces';

// Type definitions for ActionBlock responses
interface PlanResult {
  planId: string;
  tasks: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

interface JobResult {
  success: boolean;
  jobId: string;
  subJobs: Array<{
    id: string;
    name: string;
  }>;
  subJobCount: number;
}

interface ActionBlockResponse<T> {
  success: boolean;
  result?: T;
  error?: string;
  sideExecutionId?: string;
}

const systemPrompt: string = `
You are a task orchestration agent. You help users plan and execute complex tasks.
When the user provides a task, you will:
1. Create a plan using the planning ActionBlock
2. Break the plan into jobs using the job creation ActionBlock
3. Report the results to the user
`.trim();

codebolt.onMessage(async (reqMessage: FlatUserMessage): Promise<void> => {
  try {
    codebolt.chat.sendMessage('Starting task orchestration...');

    // ✅ CORRECT: Invoke ActionBlocks for complex logic
    // Step 1: Create a plan using the ActionBlock (NOT inline implementation)
    const planResponse: ActionBlockResponse<PlanResult> = await codebolt.actionBlock.start(
      'create-plan-for-given-task',
      { userMessage: reqMessage }
    );

    if (!planResponse.success || !planResponse.result) {
      codebolt.chat.sendMessage(`Planning failed: ${planResponse.error || 'Unknown error'}`);
      return;
    }

    const plan: PlanResult = planResponse.result;
    codebolt.chat.sendMessage(`Plan created with ${plan.tasks.length} tasks`);

    // Step 2: Break tasks into jobs using ActionBlock (NOT inline implementation)
    for (const task of plan.tasks) {
      const jobResponse: ActionBlockResponse<JobResult> = await codebolt.actionBlock.start(
        'break-task-into-jobs',
        {
          plan: plan,
          task: task,
          existingJobs: []
        }
      );

      if (jobResponse.success && jobResponse.result) {
        codebolt.chat.sendMessage(
          `Task "${task.name}": Created ${jobResponse.result.subJobCount} sub-jobs`
        );
      }
    }

    // Step 3: Now use the agent loop for any remaining interaction
    const promptGenerator: InitialPromptGenerator = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
        new ToolInjectionModifier({ includeToolDescriptions: true })
      ],
      baseSystemPrompt: systemPrompt
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let completed: boolean = false;

    do {
      const agent: AgentStep = new AgentStep({
        preInferenceProcessors: [],
        postInferenceProcessors: []
      });
      const result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);
      prompt = result.nextMessage;

      const responseExecutor: ResponseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: []
      });
      const executionResult: ResponseExecutorResult = await responseExecutor.executeResponse({
        initialUserMessage: reqMessage,
        actualMessageSentToLLM: result.actualMessageSentToLLM,
        rawLLMOutput: result.rawLLMResponse,
        nextMessage: result.nextMessage
      });

      completed = executionResult.completed;
      prompt = executionResult.nextMessage;

    } while (!completed);

    codebolt.chat.sendMessage('Task orchestration complete!');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    codebolt.chat.sendMessage(`Error: ${errorMessage}`);
  }
});
```

**Key Points:**
- All variables have explicit TypeScript types
- ActionBlock responses are typed with interfaces
- Complex logic (planning, job creation) uses `codebolt.actionBlock.start()`
- The agent loop is used for orchestration and user interaction
- Error handling uses proper type guards

---

## Remix Agent Examples (No-Code)

### Simple Code Assistant

Create file: `.codebolt/agents/remix/code-assistant.md`

```markdown
---
name: code-assistant
description: A helpful coding assistant
model: claude-sonnet-4-20250514
provider: anthropic
tools:
  - codebolt--readFile
  - codebolt--writeFile
  - codebolt--search
maxSteps: 50
version: 1.0.0
---

# Instructions

You are a helpful coding assistant. Help users with:
- Writing new code
- Debugging existing code
- Explaining code concepts
- Refactoring suggestions

Always explain your reasoning before making changes.
```

### Security Auditor (Read-Only)

```markdown
---
name: security-auditor
description: Scans code for security vulnerabilities
tools:
  - codebolt--readFile
  - codebolt--listFiles
  - codebolt--search
maxSteps: 100
reasoningEffort: high
---

# Security Audit Instructions

You audit code for security vulnerabilities. Check for:

## OWASP Top 10
- Injection attacks (SQL, command, etc.)
- Broken authentication
- Sensitive data exposure
- XML external entities (XXE)
- Broken access control
- Security misconfiguration
- Cross-site scripting (XSS)
- Insecure deserialization
- Using components with known vulnerabilities
- Insufficient logging & monitoring

## Output Format
| Severity | Location | Issue | Recommendation |
|----------|----------|-------|----------------|
| Critical | file:line | description | fix |

Never modify files. Report only.
```

### API Documentation Generator

```markdown
---
name: api-docs-generator
description: Generates API documentation from code
model: claude-sonnet-4-20250514
tools:
  - codebolt--readFile
  - codebolt--writeFile
  - codebolt--listFiles
skills:
  - technical-writing
maxSteps: 75
---

# API Documentation Generator

Generate comprehensive API documentation.

## For Each Endpoint:
1. **Method & Path**: GET /api/users
2. **Description**: What it does
3. **Parameters**: Query, path, body
4. **Request Example**: curl or fetch
5. **Response Example**: JSON with types
6. **Error Codes**: 4xx, 5xx responses

## Style
- Use OpenAPI/Swagger format when possible
- Include TypeScript types
- Add practical examples
```

---

## Level 1 Examples (Direct APIs)

### Basic Chat Bot

```typescript
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';

codebolt.onMessage(async (userMessage: FlatUserMessage) => {
  const response = await codebolt.llm.inference({
    messages: [
      { role: 'system', content: 'You are a friendly assistant.' },
      { role: 'user', content: userMessage.userMessage }
    ]
  });

  codebolt.chat.sendMessage(response.completion.choices[0].message.content);
});
```

### File Assistant (Manual Loop)

```typescript
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage, ChatMessage, ToolCall } from '@codebolt/types/sdk';

const MAX_ITERATIONS: number = 15;

interface LLMMessage extends ChatMessage {
  tool_calls?: ToolCall[];
}

codebolt.onMessage(async (userMessage: FlatUserMessage): Promise<void> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a file assistant. Help with file operations.' },
    { role: 'user', content: userMessage.userMessage }
  ];

  const toolsResponse = await codebolt.mcp.listMcpFromServers(['codebolt']);
  const tools = toolsResponse?.data?.tools || [];

  for (let i: number = 0; i < MAX_ITERATIONS; i++) {
    const response = await codebolt.llm.inference({ messages, tools, tool_choice: 'auto' });
    const msg: LLMMessage = response.completion.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls?.length) {
      codebolt.chat.sendMessage(msg.content || '');
      return;
    }

    for (const call of msg.tool_calls) {
      const [toolbox, toolName]: string[] = call.function.name.split('--');
      const args: Record<string, unknown> = JSON.parse(call.function.arguments);

      try {
        const result = await codebolt.mcp.executeTool(toolbox, toolName, args);
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result.data) });
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
        messages.push({ role: 'tool', tool_call_id: call.id, content: `Error: ${errorMessage}` });
      }
    }
  }
});
```

---

## Level 2 Examples (Base Components)

### Custom Loop with Inspection

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import { ChatHistoryMessageModifier, CoreSystemPromptModifier, ToolInjectionModifier } from '@codebolt/agent/processor-pieces';
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage, AgentStepOutput, ResponseExecutorResult } from '@codebolt/types/agent';

class InspectableAgent {
  private promptGen: InitialPromptGenerator;
  private agentStep: AgentStep;
  private responseExec: ResponseExecutor;
  private logs: string[] = [];

  constructor() {
    this.promptGen = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier(),
        new CoreSystemPromptModifier({ customSystemPrompt: 'You are a helpful assistant.' }),
        new ToolInjectionModifier()
      ]
    });

    this.agentStep = new AgentStep({});
    this.responseExec = new ResponseExecutor({ preToolCallProcessors: [], postToolCallProcessors: [] });
  }

  async execute(userMessage: FlatUserMessage): Promise<{ result: string | undefined; logs: string[] }> {
    let prompt: ProcessedMessage = await this.promptGen.processMessage(userMessage);
    this.log(`Processed message with ${prompt.message.messages.length} messages`);

    for (let i: number = 0; i < 20; i++) {
      const stepResult: AgentStepOutput = await this.agentStep.executeStep(userMessage, prompt);

      const toolCalls = stepResult.rawLLMResponse.choices[0].message.tool_calls;
      this.log(`Iteration ${i}: ${toolCalls?.length || 0} tool calls`);

      if (toolCalls?.length) {
        for (const tc of toolCalls) {
          this.log(`  - ${tc.function.name}`);
        }
      }

      const execResult: ResponseExecutorResult = await this.responseExec.executeResponse({
        nextMessage: stepResult.nextMessage,
        rawLLMOutput: stepResult.rawLLMResponse,
        actualMessageSentToLLM: stepResult.actualMessageSentToLLM
      });

      if (execResult.completed) {
        this.log('Task completed');
        return { result: execResult.finalMessage, logs: this.logs };
      }

      prompt = execResult.nextMessage;
    }

    throw new Error('Max iterations');
  }

  private log(msg: string) {
    this.logs.push(`[${new Date().toISOString()}] ${msg}`);
  }
}
```

### Rate-Limited Agent

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage } from '@codebolt/types/agent';

class RateLimitedAgent {
  private lastCallTime = 0;
  private minDelayMs = 1000;

  async executeStep(userMessage: FlatUserMessage, prompt: ProcessedMessage) {
    // Ensure minimum delay between LLM calls
    const elapsed = Date.now() - this.lastCallTime;
    if (elapsed < this.minDelayMs) {
      await new Promise(r => setTimeout(r, this.minDelayMs - elapsed));
    }

    const agentStep = new AgentStep({});
    const result = await agentStep.executeStep(userMessage, prompt);

    this.lastCallTime = Date.now();
    return result;
  }
}
```

### Agent with Custom Local Tool

This example shows how to add a custom tool that executes locally (not through MCP) while still using ResponseExecutor for standard tools.

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import { BasePreToolCallProcessor, ToolInjectionModifier, CoreSystemPromptModifier } from '@codebolt/agent/processor-pieces';
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { PreToolCallProcessorInput, ProcessedMessage, AgentStepOutput, ResponseExecutorResult } from '@codebolt/types/agent';

// 1. Define your custom tool processor
class DataTransformToolProcessor extends BasePreToolCallProcessor {
  async modify(input: PreToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    const toolCalls = input.rawLLMResponseMessage.choices?.[0]?.message?.tool_calls || [];
    const handledToolIds = new Set<string>();

    for (const toolCall of toolCalls) {
      if (toolCall.function.name === 'transform_data') {
        const args = JSON.parse(toolCall.function.arguments);

        // Execute custom transformation logic
        const result = this.transformData(args.data, args.format);

        // Add result to conversation
        input.nextPrompt.message.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });

        handledToolIds.add(toolCall.id);
      }
    }

    // Remove handled tools so ResponseExecutor skips them
    if (handledToolIds.size > 0) {
      const message = input.rawLLMResponseMessage.choices?.[0]?.message;
      if (message?.tool_calls) {
        message.tool_calls = message.tool_calls.filter(tc => !handledToolIds.has(tc.id));
      }
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }

  private transformData(data: unknown, format: string): { transformed: string } {
    // Your custom logic here
    if (format === 'json') {
      return { transformed: JSON.stringify(data, null, 2) };
    } else if (format === 'csv') {
      // Convert to CSV...
      return { transformed: 'col1,col2\nval1,val2' };
    }
    return { transformed: String(data) };
  }
}

// 2. Define the tool schema for LLM
const transformToolSchema = {
  type: 'function',
  function: {
    name: 'transform_data',
    description: 'Transform data into different formats (json, csv, etc.)',
    parameters: {
      type: 'object',
      properties: {
        data: { type: 'object', description: 'Data to transform' },
        format: { type: 'string', enum: ['json', 'csv', 'text'], description: 'Target format' }
      },
      required: ['data', 'format']
    }
  }
};

// 3. Set up the agent with custom tool
const promptGenerator = new InitialPromptGenerator({
  processors: [
    new CoreSystemPromptModifier({
      customSystemPrompt: 'You are a data processing assistant. Use transform_data for conversions.'
    }),
    new ToolInjectionModifier({
      additionalTools: [transformToolSchema]  // Add custom tool to available tools
    })
  ]
});

const agentStep = new AgentStep({});

const responseExecutor = new ResponseExecutor({
  preToolCallProcessors: [
    new DataTransformToolProcessor()  // Handle custom tool before MCP execution
  ],
  postToolCallProcessors: []
});

// 4. Agent loop
codebolt.onMessage(async (userMessage: FlatUserMessage): Promise<void> => {
  let prompt: ProcessedMessage = await promptGenerator.processMessage(userMessage);
  let completed: boolean = false;

  while (!completed) {
    const stepResult: AgentStepOutput = await agentStep.executeStep(userMessage, prompt);

    // ResponseExecutor handles both custom tools (via processor) and MCP tools
    const execResult: ResponseExecutorResult = await responseExecutor.executeResponse({
      initialUserMessage: userMessage,
      actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
      rawLLMOutput: stepResult.rawLLMResponse,
      nextMessage: stepResult.nextMessage
    });

    completed = execResult.completed;
    prompt = execResult.nextMessage;
  }
});
```

**Key Points:**
- Custom tools are handled by `PreToolCallProcessor` before ResponseExecutor runs
- Standard MCP tools are still executed by ResponseExecutor automatically
- The tool schema must be injected via `ToolInjectionModifier.additionalTools`
- Remove handled tool calls from the LLM response so ResponseExecutor skips them

---

## Level 3 Examples (High-Level)

### Simple Coding Assistant

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';

import type { AgentResult } from '@codebolt/types/agent';

const agent: CodeboltAgent = new CodeboltAgent({
  instructions: 'You are a coding assistant. Help with code, debugging, and explanations.',
  enableLogging: true
});

codebolt.onMessage(async (msg: FlatUserMessage): Promise<void> => {
  const result: AgentResult = await agent.processMessage(msg);
  if (!result.success) {
    codebolt.chat.sendMessage(`Error: ${result.error}`);
  }
});
```

### Code Review Agent

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import { CoreSystemPromptModifier, IdeContextModifier, ToolInjectionModifier } from '@codebolt/agent/processor-pieces';

const reviewAgent = new CodeboltAgent({
  instructions: 'Code review expert',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier({
        customSystemPrompt: `You are an expert code reviewer.
          For each review:
          1. Check for security vulnerabilities
          2. Identify performance issues
          3. Suggest improvements
          4. Note style inconsistencies
          Format: Use markdown with severity levels (Critical/Warning/Info).`
      }),
      new IdeContextModifier({
        includeActiveFile: true,
        includeOpenFiles: true
      }),
      new ToolInjectionModifier({
        toolFilter: (t) => t.name.includes('fs') || t.name.includes('search')
      })
    ]
  }
});
```

### Project-Aware Agent

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
  CoreSystemPromptModifier,
  DirectoryContextModifier,
  MemoryImportModifier,
  ToolInjectionModifier
} from '@codebolt/agent/processor-pieces';

const projectAgent = new CodeboltAgent({
  instructions: 'Project assistant',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier({
        customSystemPrompt: 'You understand this project structure and conventions.'
      }),
      new DirectoryContextModifier({
        maxDepth: 4,
        excludePatterns: ['node_modules', '.git', 'dist', 'coverage']
      }),
      new MemoryImportModifier({
        memoryKeys: ['project_conventions', 'team_preferences'],
        scope: 'project'
      }),
      new ToolInjectionModifier()
    ]
  }
});
```

---

## Custom Modifier Examples

### API Key Injection

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage } from '@codebolt/types/agent';

class ApiKeyModifier extends BaseMessageModifier {
  private apiKeys: Record<string, string>;

  constructor(apiKeys: Record<string, string>) {
    super();
    this.apiKeys = apiKeys;
  }

  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const keysInfo: string = Object.keys(this.apiKeys)
      .map((k: string) => `- ${k}: Available`)
      .join('\n');

    createdMessage.message.messages.push({
      role: 'system',
      content: `Available API integrations:\n${keysInfo}\nUse these when needed.`
    });

    return createdMessage;
  }
}
```

### User Preferences Loader

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage } from '@codebolt/types/agent';

class UserPreferencesModifier extends BaseMessageModifier {
  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const prefs = await codebolt.memory.json.list({ type: 'user_preferences' });

    if (prefs.data?.length) {
      const prefsText: string = JSON.stringify(prefs.data[0], null, 2);
      createdMessage.message.messages.push({
        role: 'system',
        content: `User preferences:\n${prefsText}`
      });
    }

    return createdMessage;
  }
}
```

---

## Custom Processor Examples

### Audit Logger

```typescript
import { BasePostToolCallProcessor } from '@codebolt/agent/processor-pieces';
import codebolt from '@codebolt/codeboltjs';
import type { PostToolCallProcessorInput, ProcessedMessage } from '@codebolt/types/agent';

interface ToolResult {
  tool_call_id: string;
  content: string;
}

class AuditLogProcessor extends BasePostToolCallProcessor {
  async modify(input: PostToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    const toolResults: ToolResult[] = input.toolResults || [];

    for (const result of toolResults) {
      await codebolt.memory.json.save({
        type: 'audit_log',
        timestamp: new Date().toISOString(),
        toolId: result.tool_call_id,
        success: !result.content.includes('Error')
      });
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

### Cost Tracker

```typescript
import { BasePostInferenceProcessor } from '@codebolt/agent/processor-pieces';
import type { ProcessedMessage, LLMResponse } from '@codebolt/types/agent';

interface TokenUsage {
  total_tokens: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

class CostTrackerProcessor extends BasePostInferenceProcessor {
  private totalTokens: number = 0;
  private maxTokens: number;

  constructor(maxTokens: number = 100000) {
    super();
    this.maxTokens = maxTokens;
  }

  async modify(
    llmMessageSent: ProcessedMessage,
    llmResponseMessage: LLMResponse,
    nextPrompt: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const usage: TokenUsage | undefined = llmResponseMessage.usage;
    if (usage) {
      this.totalTokens += usage.total_tokens;

      if (this.totalTokens > this.maxTokens) {
        nextPrompt.message.messages.push({
          role: 'system',
          content: 'Warning: Token budget nearly exhausted. Please wrap up.'
        });
      }
    }

    return {
      ...nextPrompt,
      metadata: {
        ...nextPrompt.metadata,
        totalTokensUsed: this.totalTokens
      }
    };
  }
}
```

---

## Workflow Examples

### Code Quality Pipeline

```typescript
import { Workflow } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';
import type { WorkflowStepResult, TerminalResult } from '@codebolt/types/agent';

interface PipelineStepData {
  output?: string;
  coverage?: string;
}

const qualityPipeline: Workflow = new Workflow({
  name: 'Code Quality',
  steps: [
    {
      id: 'lint',
      execute: async (): Promise<WorkflowStepResult<PipelineStepData>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm run lint');
        return { success: !result.error, data: { output: result.output } };
      }
    },
    {
      id: 'typecheck',
      execute: async (): Promise<WorkflowStepResult<PipelineStepData>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm run typecheck');
        return { success: !result.error, data: { output: result.output } };
      }
    },
    {
      id: 'test',
      execute: async (): Promise<WorkflowStepResult<PipelineStepData>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm test -- --coverage');
        return { success: !result.error, data: { coverage: result.output } };
      }
    }
  ]
});

const pipelineResult = await qualityPipeline.executeAsync();
console.log(`Pipeline ${pipelineResult.success ? 'passed' : 'failed'} in ${pipelineResult.executionTime}ms`);
```

### Document Generation Workflow

```typescript
import { Workflow, AgentStep, CodeboltAgent } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';
import type { WorkflowStepResult, WorkflowContext } from '@codebolt/types/agent';

interface DocWorkflowContext extends WorkflowContext {
  directory: string;
  files?: string[];
  documentation?: string;
}

const docWorkflow: Workflow = new Workflow({
  name: 'Documentation Generator',
  steps: [
    {
      id: 'scan-files',
      execute: async (ctx: DocWorkflowContext): Promise<WorkflowStepResult<{ files: string[] }>> => {
        const files = await codebolt.fs.listFile(ctx.directory, true);
        const codeFiles: string[] = files.data.filter((f: string) => f.endsWith('.ts'));
        return { success: true, data: { files: codeFiles } };
      }
    },
    new AgentStep(
      { id: 'analyze-code', description: 'Analyze code structure' },
      new CodeboltAgent({
        instructions: 'Analyze code files and identify public APIs.'
      })
    ),
    new AgentStep(
      { id: 'write-docs', description: 'Generate documentation' },
      new CodeboltAgent({
        instructions: 'Write clear documentation for the identified APIs.'
      })
    ),
    {
      id: 'save-docs',
      execute: async (ctx: DocWorkflowContext): Promise<WorkflowStepResult<void>> => {
        await codebolt.fs.createFile('API.md', ctx.documentation || '', './docs');
        return { success: true };
      }
    }
  ]
});

docWorkflow.setInitialContext({ directory: './src' });
await docWorkflow.executeAsync();
```

---

## Error Handling Patterns

### Resilient Agent

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { CodeboltAgentConfig, AgentResult } from '@codebolt/types/agent';

interface ResilientAgentResult {
  success: boolean;
  result?: string;
  error?: string;
}

class ResilientAgent {
  private agent: CodeboltAgent;
  private maxRetries: number = 3;

  constructor(config: CodeboltAgentConfig) {
    this.agent = new CodeboltAgent(config);
  }

  async execute(message: FlatUserMessage): Promise<ResilientAgentResult> {
    let lastError: Error | null = null;

    for (let attempt: number = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result: AgentResult = await this.agent.processMessage(message);
        if (result.success) return result;
        lastError = new Error(result.error || 'Unknown error');
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }

      // Exponential backoff
      await new Promise<void>((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }

    return { success: false, error: lastError?.message };
  }
}
```

### Graceful Degradation

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { AgentResult } from '@codebolt/types/agent';

class GracefulAgent {
  private primaryAgent: CodeboltAgent;
  private fallbackAgent: CodeboltAgent;

  constructor() {
    this.primaryAgent = new CodeboltAgent({
      instructions: 'Full-featured assistant with all tools.'
    });

    this.fallbackAgent = new CodeboltAgent({
      instructions: 'Basic assistant, no tools.',
      processors: { messageModifiers: [] }  // No tool injection
    });
  }

  async execute(message: FlatUserMessage): Promise<AgentResult> {
    try {
      const result: AgentResult = await this.primaryAgent.processMessage(message);
      if (result.success) return result;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Primary agent failed: ${errorMessage}, using fallback`);
    }

    return this.fallbackAgent.processMessage(message);
  }
}
```
