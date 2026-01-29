# Examples

Comprehensive examples for each abstraction level.

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

codebolt.onMessage(async (userMessage) => {
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

const MAX_ITERATIONS = 15;

codebolt.onMessage(async (userMessage) => {
  const messages = [
    { role: 'system', content: 'You are a file assistant. Help with file operations.' },
    { role: 'user', content: userMessage.userMessage }
  ];

  const tools = (await codebolt.mcp.listMcpFromServers(['codebolt']))?.data?.tools || [];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await codebolt.llm.inference({ messages, tools, tool_choice: 'auto' });
    const msg = response.completion.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls?.length) {
      codebolt.chat.sendMessage(msg.content);
      return;
    }

    for (const call of msg.tool_calls) {
      const [toolbox, toolName] = call.function.name.split('--');
      const args = JSON.parse(call.function.arguments);

      try {
        const result = await codebolt.mcp.executeTool(toolbox, toolName, args);
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result.data) });
      } catch (e) {
        messages.push({ role: 'tool', tool_call_id: call.id, content: `Error: ${e.message}` });
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

  async execute(userMessage) {
    let prompt = await this.promptGen.processMessage(userMessage);
    this.log(`Processed message with ${prompt.message.messages.length} messages`);

    for (let i = 0; i < 20; i++) {
      const stepResult = await this.agentStep.executeStep(userMessage, prompt);

      const toolCalls = stepResult.rawLLMResponse.choices[0].message.tool_calls;
      this.log(`Iteration ${i}: ${toolCalls?.length || 0} tool calls`);

      if (toolCalls?.length) {
        for (const tc of toolCalls) {
          this.log(`  - ${tc.function.name}`);
        }
      }

      const execResult = await this.responseExec.executeResponse({
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

class RateLimitedAgent {
  private lastCallTime = 0;
  private minDelayMs = 1000;

  async executeStep(userMessage, prompt) {
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

---

## Level 3 Examples (High-Level)

### Simple Coding Assistant

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';

const agent = new CodeboltAgent({
  instructions: 'You are a coding assistant. Help with code, debugging, and explanations.',
  enableLogging: true
});

codebolt.onMessage(async (msg) => {
  const result = await agent.processMessage(msg);
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

class ApiKeyModifier extends BaseMessageModifier {
  constructor(private apiKeys: Record<string, string>) {
    super();
  }

  async modify(originalRequest, createdMessage) {
    const keysInfo = Object.keys(this.apiKeys)
      .map(k => `- ${k}: Available`)
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
class UserPreferencesModifier extends BaseMessageModifier {
  async modify(originalRequest, createdMessage) {
    const prefs = await codebolt.memory.json.list({ type: 'user_preferences' });

    if (prefs.data?.length) {
      const prefsText = JSON.stringify(prefs.data[0], null, 2);
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

class AuditLogProcessor extends BasePostToolCallProcessor {
  async modify(input) {
    const { toolResults } = input;

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

class CostTrackerProcessor extends BasePostInferenceProcessor {
  private totalTokens = 0;
  private maxTokens: number;

  constructor(maxTokens = 100000) {
    super();
    this.maxTokens = maxTokens;
  }

  async modify(llmMessageSent, llmResponseMessage, nextPrompt) {
    const usage = llmResponseMessage.usage;
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

const qualityPipeline = new Workflow({
  name: 'Code Quality',
  steps: [
    {
      id: 'lint',
      execute: async () => {
        const result = await codebolt.terminal.executeCommand('npm run lint');
        return { success: !result.error, data: { output: result.output } };
      }
    },
    {
      id: 'typecheck',
      execute: async () => {
        const result = await codebolt.terminal.executeCommand('npm run typecheck');
        return { success: !result.error, data: { output: result.output } };
      }
    },
    {
      id: 'test',
      execute: async () => {
        const result = await codebolt.terminal.executeCommand('npm test -- --coverage');
        return { success: !result.error, data: { coverage: result.output } };
      }
    }
  ]
});

const result = await qualityPipeline.executeAsync();
console.log(`Pipeline ${result.success ? 'passed' : 'failed'} in ${result.executionTime}ms`);
```

### Document Generation Workflow

```typescript
import { Workflow, AgentStep, CodeboltAgent } from '@codebolt/agent/unified';

const docWorkflow = new Workflow({
  name: 'Documentation Generator',
  steps: [
    {
      id: 'scan-files',
      execute: async (ctx) => {
        const files = await codebolt.fs.listFile(ctx.directory, true);
        const codeFiles = files.data.filter(f => f.endsWith('.ts'));
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
      execute: async (ctx) => {
        await codebolt.fs.createFile('API.md', ctx.documentation, './docs');
        return { success: true };
      }
    }
  ]
});

docWorkflow.setInitialContext({ directory: './src' });
await docWorkflow.executeAsync();
```

---

## Multi-Agent Patterns

### Orchestrator Pattern

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

class AgentOrchestrator {
  private agents = new Map<string, CodeboltAgent>();

  constructor() {
    this.agents.set('planner', new CodeboltAgent({
      instructions: 'Break tasks into subtasks.'
    }));

    this.agents.set('coder', new CodeboltAgent({
      instructions: 'Write clean, tested code.'
    }));

    this.agents.set('reviewer', new CodeboltAgent({
      instructions: 'Review code for issues.'
    }));
  }

  async execute(task: string, context: { threadId: string; messageId: string }) {
    // 1. Plan
    const plan = await this.agents.get('planner')!.processMessage({
      userMessage: `Plan: ${task}`,
      ...context
    });

    // 2. Code
    const code = await this.agents.get('coder')!.processMessage({
      userMessage: `Implement: ${plan.result}`,
      ...context
    });

    // 3. Review
    const review = await this.agents.get('reviewer')!.processMessage({
      userMessage: `Review: ${code.result}`,
      ...context
    });

    return { plan, code, review };
  }
}
```

### Specialist Delegation

```typescript
class SpecialistRouter {
  private specialists = new Map<string, CodeboltAgent>();

  constructor() {
    this.specialists.set('frontend', new CodeboltAgent({
      instructions: 'Expert in React, CSS, HTML.'
    }));

    this.specialists.set('backend', new CodeboltAgent({
      instructions: 'Expert in Node.js, databases, APIs.'
    }));

    this.specialists.set('devops', new CodeboltAgent({
      instructions: 'Expert in CI/CD, Docker, Kubernetes.'
    }));
  }

  async route(task: string, context: any) {
    // Determine specialist
    const keywords = task.toLowerCase();
    let specialist = 'backend'; // default

    if (keywords.includes('react') || keywords.includes('css') || keywords.includes('ui')) {
      specialist = 'frontend';
    } else if (keywords.includes('deploy') || keywords.includes('docker') || keywords.includes('ci')) {
      specialist = 'devops';
    }

    return this.specialists.get(specialist)!.processMessage({
      userMessage: task,
      ...context
    });
  }
}
```

---

## Error Handling Patterns

### Resilient Agent

```typescript
class ResilientAgent {
  private agent: CodeboltAgent;
  private maxRetries = 3;

  constructor(config: any) {
    this.agent = new CodeboltAgent(config);
  }

  async execute(message: any) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.agent.processMessage(message);
        if (result.success) return result;
        lastError = new Error(result.error);
      } catch (e) {
        lastError = e as Error;
      }

      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }

    return { success: false, error: lastError?.message };
  }
}
```

### Graceful Degradation

```typescript
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

  async execute(message: any) {
    try {
      const result = await this.primaryAgent.processMessage(message);
      if (result.success) return result;
    } catch (e) {
      console.warn('Primary agent failed, using fallback');
    }

    return this.fallbackAgent.processMessage(message);
  }
}
```
