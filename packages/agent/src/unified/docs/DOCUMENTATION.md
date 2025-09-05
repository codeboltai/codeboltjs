# CodeBolt Agent Package Documentation

The `@codebolt/agent` package provides a comprehensive framework for building and managing AI agents with CodeBolt. This package offers multiple architectural patterns and utilities to meet different development needs, from simple composable agents to complex multi-step workflows.

## Table of Contents

1. [Overview](#overview)
2. [Package Architecture](#package-architecture)
3. [Installation & Setup](#installation--setup)
4. [Architectural Patterns](#architectural-patterns)
5. [Core Components](#core-components)
6. [API Reference](#api-reference)
7. [Examples](#examples)
8. [Best Practices](#best-practices)
9. [Migration Guide](#migration-guide)
10. [Contributing](#contributing)

## Overview

The CodeBolt Agent package is designed to simplify AI agent development by providing:

- **Multiple Architectural Patterns**: Choose between Composable, Builder, and Processor patterns based on your needs
- **Type Safety**: Full TypeScript support with Zod validation
- **Memory Management**: Persistent conversation and state storage
- **Tool System**: Extensible tool framework for agent capabilities
- **Workflow Orchestration**: Multi-step agent processes with conditional logic
- **CodeBolt Integration**: Seamless integration with CodeBolt platform services

### Key Features

- ✅ **Simple API**: Create agents with minimal configuration
- ✅ **Composable Tools**: Define custom tools with input/output validation  
- ✅ **Memory Management**: Persistent conversation storage with multiple providers
- ✅ **Document Processing**: Built-in document chunking and processing
- ✅ **Workflow Orchestration**: Chain multiple agents and create complex pipelines
- ✅ **Model Agnostic**: Support for OpenAI, Anthropic, Ollama, and more
- ✅ **Stream Support**: Real-time streaming responses
- ✅ **Error Handling**: Robust error handling and retry mechanisms

## Package Architecture

The package is organized into several distinct architectural patterns:

```
packages/agent/
├── src/
│   ├── builderpattern/          # Fluent builder API for complex workflows
│   ├── composablepattern/       # Simple, declarative agent creation
│   ├── processor/               # Base classes for custom processors
│   ├── processor-pieces/        # Reusable processor components
│   └── types/                   # Shared TypeScript definitions
```

### Pattern Comparison

| Pattern | Complexity | Use Case | Learning Curve | Flexibility |
|---------|------------|----------|----------------|-------------|
| **Composable** | Low | Rapid prototyping, simple agents | Low | Medium |
| **Builder** | Medium | Complex workflows, custom logic | Medium | High |
| **Processor** | High | Advanced customization | High | Very High |

## Installation & Setup

### Prerequisites

- Node.js 18+
- TypeScript 5.0+
- CodeBolt platform access

### Installation

```bash
npm install @codebolt/agent
```

### Basic Setup

```typescript
import { ComposableAgent } from '@codebolt/agent/composable';
// or
import { Agent } from '@codebolt/agent/builder';
// or  
import { BaseProcessor } from '@codebolt/agent/processor';
```

## Architectural Patterns

### 1. Composable Pattern

**Best for**: Rapid prototyping, simple agents, beginners

The Composable Pattern provides a declarative API for creating agents with minimal code:

```typescript
import { ComposableAgent, createTool, Memory } from '@codebolt/agent/composable';
import { z } from 'zod';

// Define a custom tool
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeatherAPI(context.location);
  },
});

// Create agent
const agent = new ComposableAgent({
  name: 'Weather Agent',
  instructions: 'You are a helpful weather assistant.',
  model: 'gpt-4o-mini', // References codeboltagents.yaml
  tools: { weatherTool },
  memory: createCodeBoltAgentMemory('weather_agent')
});

// Execute
const result = await agent.execute('What is the weather in New York?');
```

### 2. Builder Pattern

**Best for**: Complex workflows, fine-grained control, integration with existing CodeBolt infrastructure

The Builder Pattern provides fluent interfaces for constructing complex agent workflows:

```typescript
import { 
  Agent, 
  InitialPromptBuilder, 
  LLMOutputHandler,
  FollowUpPromptBuilder 
} from '@codebolt/agent/builder';

// Create system prompt and task instruction
const systemPrompt = new SystemPrompt();
await systemPrompt.loadPrompt('./prompts/system.yaml');

const taskInstruction = new TaskInstruction();
await taskInstruction.loadInstruction('./tasks/coding-task.yaml');

// Initialize agent
const agent = new Agent([], systemPrompt);

// Build complex prompt
const promptBuilder = new InitialPromptBuilder("Fix the bug in my application");
const prompt = await promptBuilder
  .addSystemInstructions("You are a helpful coding assistant")
  .addFile("./src/problematic-file.ts")
  .addTaskDetails("Find and fix TypeScript compilation errors")
  .build();

// Process LLM output
const outputHandler = new LLMOutputHandler();
const result = await outputHandler.processLLMResponse(llmResponse, tools);
```

### 3. Processor Pattern

**Best for**: Advanced customization, custom conversation flow, specialized requirements

The Processor Pattern provides base classes for building completely custom agent behaviors:

```typescript
import { 
  BaseProcessor, 
  BaseMessageModifier, 
  BaseTool,
  AgentStep 
} from '@codebolt/agent/processor';

class CustomProcessor extends BaseProcessor {
  async process(messages: any[]): Promise<any> {
    // Custom processing logic
    return this.executeCustomFlow(messages);
  }
}

class CustomTool extends BaseTool {
  async execute(params: any): Promise<any> {
    // Custom tool implementation
    return this.performCustomAction(params);
  }
}
```

## Core Components

### Tools

Tools define what actions your agent can perform. The framework provides a type-safe tool creation system:

```typescript
const fileTool = createTool({
  id: 'read-file',
  description: 'Read contents of a file',
  inputSchema: z.object({
    path: z.string(),
    encoding: z.string().optional().default('utf8')
  }),
  outputSchema: z.object({
    content: z.string(),
    size: z.number(),
    lastModified: z.date()
  }),
  execute: async ({ context, agent }) => {
    const content = await fs.readFile(context.path, context.encoding);
    const stats = await fs.stat(context.path);
    
    return {
      content,
      size: stats.size,
      lastModified: stats.mtime
    };
  }
});
```

### Memory System

The memory system provides persistent storage for conversations and agent state:

#### CodeBolt Backend Storage (Recommended)

```typescript
// Agent-scoped persistent storage
const agentMemory = createCodeBoltAgentMemory('my_agent');

// Project-scoped persistent storage  
const projectMemory = createCodeBoltProjectMemory('project_agent');

// Fast access memory database
const dbMemory = createCodeBoltDbMemory('cache_agent');
```

#### Traditional Storage Options

```typescript
// LibSQL/SQLite storage
const memory = new Memory({
  storage: new LibSQLStore({
    url: 'file:./memory.db'
  })
});

// File storage
const memory = createFileMemory('./memory.json');

// In-memory (temporary)
const memory = createInMemoryMemory();
```

### Document Processing

Built-in document processing capabilities:

```typescript
const doc = MDocument.fromText('Your document content here');

// Chunk the document
const chunks = doc.chunk({
  size: 1000,
  overlap: 100,
  strategy: 'paragraph'
});

// Extract metadata
const metadata = doc.getMetadata();

// Process with agent
const analysis = await agent.execute(`Analyze this document: ${doc.content}`);
```

### Workflow System

Orchestrate complex multi-agent workflows:

```typescript
const contentWorkflow = createWorkflow({
  name: 'Content Creation Pipeline',
  initialData: { topic: 'AI in Healthcare' },
  steps: [
    // Research step
    createAgentStep({
      id: 'research',
      name: 'Research Topic',
      agent: researchAgent,
      messageTemplate: 'Research: {{topic}}',
      outputMapping: { 'researchData': 'agentResult.message' }
    }),
    
    // Writing step
    createAgentStep({
      id: 'write',
      name: 'Write Article',
      agent: writingAgent,
      messageTemplate: 'Write article about {{topic}} using: {{researchData}}',
      outputMapping: { 'article': 'agentResult.message' }
    }),
    
    // Conditional improvement
    createConditionalStep({
      id: 'quality-check',
      condition: (context) => needsImprovement(context.data.article),
      trueBranch: [
        createAgentStep({
          id: 'improve',
          agent: editingAgent,
          messageTemplate: 'Improve this article: {{article}}'
        })
      ]
    })
  ]
});

const result = await contentWorkflow.execute();
```

## API Reference

### ComposableAgent

#### Constructor

```typescript
new ComposableAgent(config: ComposableAgentConfig)
```

#### Configuration

```typescript
interface ComposableAgentConfig {
  name: string;
  instructions: string;
  model: string; // References codeboltagents.yaml
  tools?: Record<string, Tool>;
  memory?: Memory;
  maxTurns?: number;
  processing?: AgentProcessingConfig;
  metadata?: Record<string, any>;
}
```

#### Methods

- `execute(message: string, options?)`: Execute a single message
- `executeMessage(message: CodeBoltMessage, options?)`: Execute with CodeBolt message format  
- `run(options?)`: Start interactive session
- `addMessage(message: Message)`: Add message to conversation
- `getConversation()`: Get current conversation
- `clearConversation()`: Clear conversation history
- `saveConversation()`: Save to memory
- `loadConversation()`: Load from memory

### Tool Creation

```typescript
createTool<TInput, TOutput>(config: ToolConfig<TInput, TOutput>): Tool<TInput, TOutput>
```

```typescript
interface ToolConfig<TInput, TOutput> {
  id: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  execute: (params: { context: TInput; agent?: ComposableAgent }) => Promise<TOutput>;
}
```

### Memory API

```typescript
// Create memory instances
createCodeBoltAgentMemory(agentId: string): Memory
createCodeBoltProjectMemory(projectId: string): Memory  
createCodeBoltDbMemory(key: string): Memory

// Memory operations
memory.setConversationKey(key: string): void
memory.save(): Promise<void>
memory.load(): Promise<Message[]>
memory.clear(): Promise<void>
memory.listConversations(): Promise<string[]>
```

### Workflow API

```typescript
// Create workflow
createWorkflow(config: WorkflowConfig): Workflow

// Step types
createAgentStep(config: AgentStepConfig): WorkflowStep
createTransformStep(config: TransformStepConfig): WorkflowStep
createConditionalStep(config: ConditionalStepConfig): WorkflowStep
createDelayStep(delay: number): WorkflowStep

// Execute workflow
workflow.execute(initialData?: any): Promise<WorkflowResult>
```

## Examples

### Simple Weather Agent

```typescript
import { ComposableAgent, createTool } from '@codebolt/agent/composable';
import { z } from 'zod';

const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get weather for a location',
  inputSchema: z.object({ location: z.string() }),
  outputSchema: z.object({ 
    temperature: z.number(), 
    conditions: z.string() 
  }),
  execute: async ({ context }) => {
    // Mock weather API call
    return {
      temperature: 72,
      conditions: 'Sunny'
    };
  }
});

const agent = new ComposableAgent({
  name: 'Weather Bot',
  instructions: 'Provide weather information using the weather tool.',
  model: 'gpt-4o-mini',
  tools: { weatherTool }
});

const result = await agent.execute('What is the weather in San Francisco?');
console.log(result.message);
```

### Document Analysis Pipeline

```typescript
const analysisWorkflow = createWorkflow({
  name: 'Document Analysis',
  steps: [
    // Parallel analysis
    createAgentStep({
      id: 'sentiment',
      agent: sentimentAgent,
      parallel: true,
      messageTemplate: 'Analyze sentiment: {{text}}'
    }),
    createAgentStep({
      id: 'keywords',
      agent: keywordAgent,
      parallel: true,
      messageTemplate: 'Extract keywords: {{text}}'
    }),
    
    // Combine results
    createTransformStep({
      id: 'combine',
      dependencies: ['sentiment', 'keywords'],
      transform: (data) => ({
        analysis: {
          sentiment: data.sentimentResult,
          keywords: data.keywordResult
        }
      })
    })
  ]
});

const result = await analysisWorkflow.execute({ 
  text: 'Document content to analyze...' 
});
```

### Custom Tool with Validation

```typescript
const databaseTool = createTool({
  id: 'query-database',
  description: 'Query the database with SQL',
  inputSchema: z.object({
    query: z.string().refine(
      (sql) => sql.toLowerCase().startsWith('select'),
      'Only SELECT queries are allowed'
    ),
    limit: z.number().max(1000).default(100)
  }),
  outputSchema: z.object({
    rows: z.array(z.record(z.any())),
    count: z.number()
  }),
  execute: async ({ context }) => {
    const result = await database.query(context.query, { 
      limit: context.limit 
    });
    
    return {
      rows: result.rows,
      count: result.rowCount
    };
  }
});
```

### Streaming Responses

```typescript
const result = await agent.execute('Explain machine learning', {
  stream: true,
  callback: async (chunk) => {
    if (chunk.type === 'text') {
      process.stdout.write(chunk.content);
    } else if (chunk.type === 'tool_call') {
      console.log(`\n[Calling tool: ${chunk.tool_call?.function.name}]`);
    }
  }
});
```

## Best Practices

### 1. Tool Design

**✅ Good Practice:**
```typescript
// Focused, single-purpose tool
const readFileTool = createTool({
  id: 'read-file',
  description: 'Read contents of a specific file',
  inputSchema: z.object({
    path: z.string().describe('File path to read')
  }),
  // ...
});
```

**❌ Avoid:**
```typescript
// Overly broad tool
const fileSystemTool = createTool({
  id: 'file-operations',
  description: 'Perform various file operations',
  inputSchema: z.object({
    operation: z.enum(['read', 'write', 'delete', 'copy', 'move']),
    // ... many optional fields
  }),
  // ...
});
```

### 2. Memory Management

**✅ Use appropriate storage:**
```typescript
// For user preferences and agent state
const agentMemory = createCodeBoltAgentMemory('user_assistant');

// For project-specific data
const projectMemory = createCodeBoltProjectMemory('code_analyzer');

// For temporary caching
const cacheMemory = createCodeBoltDbMemory('api_cache');
```

### 3. Error Handling

**✅ Implement retry logic:**
```typescript
const apiTool = createTool({
  id: 'api-call',
  // ...
  execute: async ({ context }) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await callExternalAPI(context.url);
      } catch (error) {
        if (attempt === 3) throw error;
        await delay(1000 * attempt); // Exponential backoff
      }
    }
  }
});
```

### 4. Workflow Design

**✅ Use parallel processing:**
```typescript
// Good: Independent operations run in parallel
const workflow = createWorkflow({
  steps: [
    createAgentStep({ id: 'analyze-code', parallel: true }),
    createAgentStep({ id: 'analyze-docs', parallel: true }),
    createTransformStep({ 
      id: 'combine', 
      dependencies: ['analyze-code', 'analyze-docs'] 
    })
  ]
});
```

### 5. Type Safety

**✅ Use comprehensive schemas:**
```typescript
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().min(13).max(120),
  preferences: z.record(z.any()).optional()
});
```

## Migration Guide

### From v1.x to v2.x

The main changes involve the introduction of the composable pattern and updated memory APIs:

**Before:**
```typescript
const agent = new Agent(tools, systemPrompt);
const result = await agent.runAgent(taskInstruction);
```

**After:**
```typescript
const agent = new ComposableAgent({
  name: 'My Agent',
  instructions: systemPrompt.content,
  model: 'gpt-4o-mini',
  tools: toolsObject
});
const result = await agent.execute(userMessage);
```

### Upgrading Memory Usage

**Before:**
```typescript
// Manual memory management
const memory = new CustomMemoryStore();
await memory.save(conversation);
```

**After:**
```typescript
// Built-in CodeBolt integration
const memory = createCodeBoltAgentMemory('agent_id');
// Automatic save/load
```

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/codeboltai/codeboltjs.git
cd codeboltjs/packages/agent

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm run test

# Development mode
npm run dev
```

### Adding New Features

1. **Tools**: Add to `src/composablepattern/tool.ts`
2. **Memory Providers**: Add to `src/composablepattern/memory.ts`
3. **Workflow Steps**: Add to `src/composablepattern/workflow.ts`
4. **Processors**: Add to `src/processor-pieces/`

### Testing

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test -- --grep "ComposableAgent"

# Run with coverage
npm run test:coverage
```

### Documentation

When adding new features:

1. Update relevant README files
2. Add TypeScript documentation comments
3. Include usage examples
4. Update this main documentation

### Code Style

The project uses ESLint and TypeScript strict mode:

```bash
# Lint code
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

---

## Appendix

### TypeScript Configuration

The package requires specific TypeScript settings for proper module resolution:

```json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "module": "Node16",
    "target": "ES2022",
    "strict": true
  }
}
```

### Dependencies

Core dependencies:
- `@codebolt/codeboltjs`: Core CodeBolt SDK
- `@codebolt/types`: Shared type definitions
- `zod`: Schema validation
- `js-yaml`: YAML configuration parsing

Optional dependencies:
- `@libsql/client`: LibSQL database support
- `better-sqlite3`: SQLite support

### Troubleshooting

**Module Resolution Issues:**
Ensure your `tsconfig.json` uses `"moduleResolution": "node16"`

**Memory Persistence:**
Use CodeBolt storage providers for reliable persistence across sessions

**Tool Validation Errors:**
Check that your input/output schemas match the actual data types

**Performance:**
Use parallel workflow steps and appropriate memory strategies for your use case

---

For more examples and advanced usage patterns, see the `/examples` directory in the package source code.