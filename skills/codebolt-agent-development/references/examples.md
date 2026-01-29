# Codebolt Agent Examples

## Table of Contents
1. [Basic Agents](#basic-agents)
2. [Custom Modifiers](#custom-modifiers)
3. [Custom Processors](#custom-processors)
4. [Tool-Based Agents](#tool-based-agents)
5. [Workflow Examples](#workflow-examples)
6. [Advanced Patterns](#advanced-patterns)

---

## Basic Agents

### Minimal Chat Agent

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

const agent = new CodeboltAgent({
  instructions: 'You are a helpful assistant.',
  enableLogging: true
});

const result = await agent.processMessage({
  userMessage: 'Hello, how are you?',
  threadId: 'thread-123',
  messageId: 'msg-456'
});

if (result.success) {
  console.log('Response:', result.result);
} else {
  console.error('Error:', result.error);
}
```

### Agent with Custom System Prompt

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import { CoreSystemPromptModifier, ChatHistoryMessageModifier } from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are a code review expert.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier({
        customSystemPrompt: `You are an expert code reviewer.
          Always check for:
          - Security vulnerabilities
          - Performance issues
          - Code style consistency
          - Best practices`
      }),
      new ChatHistoryMessageModifier({ enableChatHistory: true })
    ]
  }
});
```

### Agent with IDE Context

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
  CoreSystemPromptModifier,
  IdeContextModifier,
  DirectoryContextModifier
} from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You are a coding assistant aware of the IDE state.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier(),
      new IdeContextModifier({
        includeActiveFile: true,
        includeOpenFiles: true,
        includeCursorPosition: true
      }),
      new DirectoryContextModifier({
        maxDepth: 3,
        excludePatterns: ['node_modules', '.git']
      })
    ]
  }
});
```

---

## Custom Modifiers

### Add Custom Context

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';
import { ProcessedMessage } from '@codebolt/types/agent';
import { FlatUserMessage } from '@codebolt/types/sdk';

class ProjectRulesModifier extends BaseMessageModifier {
  private rules: string[];

  constructor(rules: string[]) {
    super();
    this.rules = rules;
  }

  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const rulesText = this.rules.map((r, i) => `${i + 1}. ${r}`).join('\n');

    const systemMessage = {
      role: 'system' as const,
      content: `Project Rules:\n${rulesText}`
    };

    return {
      message: {
        ...createdMessage.message,
        messages: [systemMessage, ...createdMessage.message.messages]
      },
      metadata: {
        ...createdMessage.metadata,
        projectRulesInjected: true
      }
    };
  }
}

// Usage
const agent = new CodeboltAgent({
  processors: {
    messageModifiers: [
      new ProjectRulesModifier([
        'Use TypeScript strict mode',
        'All functions must have JSDoc comments',
        'No console.log in production code'
      ])
    ]
  }
});
```

### Time-Aware Modifier

```typescript
class TimeAwareModifier extends BaseMessageModifier {
  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const now = new Date();
    const hour = now.getHours();

    let greeting = '';
    if (hour < 12) greeting = 'Good morning!';
    else if (hour < 18) greeting = 'Good afternoon!';
    else greeting = 'Good evening!';

    const timeContext = {
      role: 'system' as const,
      content: `${greeting} Current time: ${now.toLocaleString()}`
    };

    return {
      message: {
        ...createdMessage.message,
        messages: [...createdMessage.message.messages, timeContext]
      },
      metadata: createdMessage.metadata
    };
  }
}
```

---

## Custom Processors

### Pre-Inference: Input Validation

```typescript
import { BasePreInferenceProcessor } from '@codebolt/agent/processor-pieces';

class InputValidationProcessor extends BasePreInferenceProcessor {
  private maxLength: number;
  private blockedPatterns: RegExp[];

  constructor(options: { maxLength?: number; blockedPatterns?: RegExp[] }) {
    super();
    this.maxLength = options.maxLength ?? 10000;
    this.blockedPatterns = options.blockedPatterns ?? [];
  }

  async process(
    originalMessage: FlatUserMessage,
    processedMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const userMsg = originalMessage.userMessage;

    // Check length
    if (userMsg.length > this.maxLength) {
      throw new Error(`Message exceeds maximum length of ${this.maxLength}`);
    }

    // Check blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(userMsg)) {
        throw new Error('Message contains blocked content');
      }
    }

    return processedMessage;
  }
}
```

### Post-Inference: Response Filtering

```typescript
import { BasePostInferenceProcessor } from '@codebolt/agent/processor-pieces';

class ResponseFilterProcessor extends BasePostInferenceProcessor {
  private sensitivePatterns: RegExp[];

  constructor(sensitivePatterns: RegExp[]) {
    super();
    this.sensitivePatterns = sensitivePatterns;
  }

  async process(
    llmResponse: LLMCompletion,
    context: ProcessingContext
  ): Promise<LLMCompletion> {
    const message = llmResponse.choices[0].message;

    if (typeof message.content === 'string') {
      let filtered = message.content;

      for (const pattern of this.sensitivePatterns) {
        filtered = filtered.replace(pattern, '[REDACTED]');
      }

      return {
        ...llmResponse,
        choices: [{
          ...llmResponse.choices[0],
          message: { ...message, content: filtered }
        }]
      };
    }

    return llmResponse;
  }
}
```

### Pre-Tool: Permission Gate

```typescript
import { BasePreToolCallProcessor } from '@codebolt/agent/processor-pieces';

class PermissionGateProcessor extends BasePreToolCallProcessor {
  private allowedTools: Set<string>;
  private requireApproval: Set<string>;

  constructor(options: { allowed: string[]; requireApproval?: string[] }) {
    super();
    this.allowedTools = new Set(options.allowed);
    this.requireApproval = new Set(options.requireApproval ?? []);
  }

  async process(
    toolCall: ToolCall,
    context: ToolCallContext
  ): Promise<ToolCallDecision> {
    const toolName = toolCall.function.name;

    if (!this.allowedTools.has(toolName)) {
      return {
        proceed: false,
        reason: `Tool "${toolName}" is not allowed`
      };
    }

    if (this.requireApproval.has(toolName)) {
      // In real implementation, would prompt user for approval
      console.log(`Tool "${toolName}" requires approval`);
    }

    return { proceed: true };
  }
}
```

### Post-Tool: Result Logging

```typescript
import { BasePostToolCallProcessor } from '@codebolt/agent/processor-pieces';

class ToolResultLogger extends BasePostToolCallProcessor {
  async process(
    toolResult: ToolResult,
    context: ToolResultContext
  ): Promise<ToolResult> {
    console.log('Tool executed:', {
      tool: context.toolName,
      success: toolResult.success,
      executionTime: context.executionTime,
      resultSize: JSON.stringify(toolResult.data).length
    });

    return toolResult;
  }
}
```

---

## Tool-Based Agents

### Agent with Custom Tools

```typescript
import { CodeboltAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const fetchWeatherTool = createTool({
  id: 'fetch-weather',
  description: 'Get current weather for a city',
  inputSchema: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  execute: async ({ input }) => {
    // Simulated weather API call
    return {
      city: input.city,
      temperature: 22,
      units: input.units,
      conditions: 'Partly cloudy'
    };
  }
});

const calculateTool = createTool({
  id: 'calculate',
  description: 'Perform mathematical calculations',
  inputSchema: z.object({
    expression: z.string().describe('Math expression to evaluate')
  }),
  execute: async ({ input }) => {
    // Safe math evaluation (use a proper library in production)
    const result = Function(`'use strict'; return (${input.expression})`)();
    return { expression: input.expression, result };
  }
});

const agent = new CodeboltAgent({
  instructions: 'You can check weather and perform calculations.',
  // Tools are automatically available via ToolInjectionModifier
});
```

### File Operations Agent

```typescript
import { CodeboltAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';
import codebolt from '@anthropic-ai/codeboltjs';

const readFileTool = createTool({
  id: 'read-file',
  description: 'Read contents of a file',
  inputSchema: z.object({
    path: z.string().describe('File path to read')
  }),
  execute: async ({ input }) => {
    const content = await codebolt.fs.readFile(input.path);
    return { path: input.path, content };
  }
});

const writeFileTool = createTool({
  id: 'write-file',
  description: 'Write content to a file',
  inputSchema: z.object({
    path: z.string().describe('File path'),
    content: z.string().describe('Content to write')
  }),
  execute: async ({ input }) => {
    await codebolt.fs.writeFile(input.path, input.content);
    return { success: true, path: input.path };
  }
});

const listFilesTool = createTool({
  id: 'list-files',
  description: 'List files in a directory',
  inputSchema: z.object({
    path: z.string().describe('Directory path'),
    pattern: z.string().optional().describe('Glob pattern')
  }),
  execute: async ({ input }) => {
    const files = await codebolt.fs.listFiles(input.path, input.pattern);
    return { path: input.path, files };
  }
});
```

---

## Workflow Examples

### Sequential Workflow

```typescript
import { Workflow } from '@codebolt/agent/unified';

const codeReviewWorkflow = new Workflow({
  name: 'Code Review Pipeline',
  steps: [
    {
      id: 'lint',
      name: 'Run Linter',
      execute: async (context) => {
        // Run linting
        const lintResults = await runLinter(context.files);
        return {
          success: lintResults.errors === 0,
          data: { lintResults }
        };
      }
    },
    {
      id: 'test',
      name: 'Run Tests',
      execute: async (context) => {
        const testResults = await runTests();
        return {
          success: testResults.passed,
          data: { testResults }
        };
      }
    },
    {
      id: 'review',
      name: 'AI Code Review',
      execute: async (context) => {
        const agent = new CodeboltAgent({
          instructions: 'Review the code changes.'
        });
        const review = await agent.processMessage({
          userMessage: `Review these changes: ${context.diff}`,
          threadId: context.threadId,
          messageId: context.messageId
        });
        return {
          success: true,
          data: { review: review.result }
        };
      }
    }
  ]
});

const result = await codeReviewWorkflow.executeAsync({
  files: ['src/index.ts'],
  diff: '...',
  threadId: 'thread-1',
  messageId: 'msg-1'
});
```

### Conditional Workflow

```typescript
const deploymentWorkflow = new Workflow({
  name: 'Deployment Pipeline',
  steps: [
    {
      id: 'check-branch',
      execute: async (context) => {
        const branch = await getCurrentBranch();
        return {
          success: true,
          data: { branch, isMain: branch === 'main' }
        };
      }
    },
    {
      id: 'run-tests',
      execute: async (context) => {
        const results = await runTests();
        return { success: results.passed, data: { results } };
      }
    },
    {
      id: 'deploy-staging',
      condition: (context) => !context.isMain,
      execute: async (context) => {
        await deployToStaging();
        return { success: true };
      }
    },
    {
      id: 'deploy-production',
      condition: (context) => context.isMain,
      execute: async (context) => {
        await deployToProduction();
        return { success: true };
      }
    }
  ]
});
```

---

## Advanced Patterns

### Agent with Memory

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import { MemoryImportModifier } from '@codebolt/agent/processor-pieces';
import codebolt from '@anthropic-ai/codeboltjs';

// Store information
await codebolt.memory.set('user_preferences', {
  language: 'TypeScript',
  framework: 'React',
  style: 'functional'
});

// Agent with memory
const agent = new CodeboltAgent({
  instructions: 'Use the user preferences when generating code.',
  processors: {
    messageModifiers: [
      new MemoryImportModifier({
        memoryKeys: ['user_preferences'],
        scope: 'user'
      })
    ]
  }
});
```

### Multi-Agent Orchestration

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

class AgentOrchestrator {
  private agents: Map<string, CodeboltAgent>;

  constructor() {
    this.agents = new Map();

    // Create specialized agents
    this.agents.set('planner', new CodeboltAgent({
      instructions: 'Break down tasks into steps.'
    }));

    this.agents.set('coder', new CodeboltAgent({
      instructions: 'Write clean, tested code.'
    }));

    this.agents.set('reviewer', new CodeboltAgent({
      instructions: 'Review code for issues.'
    }));
  }

  async execute(task: string, context: { threadId: string; messageId: string }) {
    // Plan
    const plan = await this.agents.get('planner')!.processMessage({
      userMessage: `Plan this task: ${task}`,
      ...context
    });

    // Execute
    const code = await this.agents.get('coder')!.processMessage({
      userMessage: `Implement: ${plan.result}`,
      ...context
    });

    // Review
    const review = await this.agents.get('reviewer')!.processMessage({
      userMessage: `Review: ${code.result}`,
      ...context
    });

    return { plan: plan.result, code: code.result, review: review.result };
  }
}
```

### Streaming Response Handler

```typescript
import { Agent } from '@codebolt/agent/unified';

const agent = new Agent({
  instructions: 'You are a helpful assistant.'
});

// With streaming callback
const result = await agent.execute(
  {
    userMessage: 'Write a long story',
    threadId: 'thread-1',
    messageId: 'msg-1'
  },
  {
    onStream: (chunk: StreamChunk) => {
      process.stdout.write(chunk.content);
    }
  }
);
```

### Error Recovery Pattern

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

class ResilientAgent {
  private agent: CodeboltAgent;
  private maxRetries: number;

  constructor(config: AgentConfig, maxRetries = 3) {
    this.agent = new CodeboltAgent(config);
    this.maxRetries = maxRetries;
  }

  async execute(message: FlatUserMessage) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.agent.processMessage(message);

        if (result.success) {
          return result;
        }

        lastError = new Error(result.error);
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt} failed: ${lastError.message}`);

        // Exponential backoff
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }

    throw lastError;
  }
}
```
