# Composable Agent Pattern

A simple, composable API for creating and managing AI agents with memory, tools, and document processing capabilities.

## Features

- **Simple API**: Create agents with minimal configuration
- **Composable Tools**: Define custom tools with input/output validation
- **Memory Management**: Persistent conversation storage with multiple providers
- **Document Processing**: Built-in document chunking and processing
- **Workflow Orchestration**: Chain multiple agents and create complex pipelines
- **Type Safety**: Full TypeScript support with Zod validation
- **Model Agnostic**: Support for OpenAI, Anthropic, Ollama, and more

## Quick Start

```typescript
import { ComposableAgent, createTool, Memory, LibSQLStore, openai, z } from '@codebolt/agent/composable';

// Create a weather tool
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
    // Your weather API call here
    return await getWeather(context.location);
  },
});

// Create agent with memory
const agent = new ComposableAgent({
  name: 'Weather Agent',
  instructions: `
    You are a helpful weather assistant.
    Use the weatherTool to fetch current weather data.
  `,
  model: openai('gpt-4o-mini'),
  tools: { weatherTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:./agent-memory.db',
    }),
  }),
});

// Execute a task
const result = await agent.execute('What is the weather in New York?');
console.log(result.message);
```

## Core Concepts

### ComposableAgent

The main agent class that orchestrates conversation flow, tool execution, and memory management.

```typescript
const agent = new ComposableAgent({
  name: 'My Agent',
  instructions: 'System prompt for the agent',
  model: openai('gpt-4o-mini'),
  tools: { toolName: toolInstance },
  memory: memoryInstance,
  maxTurns: 10 // optional
});
```

### Tools

Tools define what actions your agent can perform. Each tool has:
- **Input Schema**: Zod schema for validation
- **Output Schema**: Zod schema for validation  
- **Execute Function**: The actual implementation

```typescript
const myTool = createTool({
  id: 'my-tool',
  description: 'What this tool does',
  inputSchema: z.object({
    param: z.string()
  }),
  outputSchema: z.object({
    result: z.string()
  }),
  execute: async ({ context, agent }) => {
    // Your tool logic here
    return { result: 'Tool result' };
  }
});
```

### Memory

Memory manages conversation persistence across sessions. Use CodeBolt's built-in storage for seamless integration:

#### CodeBolt Backend Storage (Recommended)

```typescript
// Agent state storage (user/agent scoped, persistent)
const agentMemory = createCodeBoltAgentMemory('my_agent');

// Project state storage (project scoped, persistent)  
const projectMemory = createCodeBoltProjectMemory('my_project_agent');

// Memory database storage (fast access, may be temporary)
const dbMemory = createCodeBoltDbMemory('cache_agent');

const agent = new ComposableAgent({
  // ... other config
  memory: agentMemory // No external dependencies needed!
});
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

// In-memory (lost on restart)
const memory = createInMemoryMemory();
```

#### Storage Comparison

| Storage Type | Persistence | Scope | Best For |
|-------------|-------------|-------|----------|
| CodeBolt Agent | ✅ Persistent | User/Agent | User preferences, agent settings |
| CodeBolt Project | ✅ Persistent | Project | Project-specific data, shared state |
| CodeBolt Memory DB | ⚡ Fast Access | Session | Caching, temporary data |
| LibSQL/SQLite | ✅ Persistent | Local File | Advanced queries, large datasets |
| File Storage | ✅ Persistent | Local File | Simple persistence, debugging |
| In-Memory | ❌ Temporary | Process | Testing, temporary use |

### Document Processing

Process and analyze documents with built-in chunking:

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
```

## Model Configuration

Model configurations are managed through the `codeboltagents.yaml` file. Simply reference the model name as a string:

```typescript
// Reference model configurations defined in codeboltagents.yaml
model: 'gpt-4o-mini'
model: 'claude-3-sonnet'  
model: 'llama2'
model: 'custom-model-name'

// Example agent configuration
const agent = new ComposableAgent({
  name: 'My Agent',
  instructions: 'You are a helpful assistant.',
  model: 'gpt-4o-mini', // This references the configuration in codeboltagents.yaml
  tools: { /* your tools */ }
});
```

### codeboltagents.yaml Configuration

The model provider details, API keys, and configurations are managed centrally in your `codeboltagents.yaml` file:

```yaml
models:
  gpt-4o-mini:
    provider: openai
    config:
      temperature: 0.7
      max_tokens: 2000
  
  claude-3-sonnet:
    provider: anthropic
    config:
      temperature: 0.8
      max_tokens: 4000
      
  custom-model:
    provider: ollama
    config:
      base_url: "http://localhost:11434"
```

## Examples

### Weather Agent

```typescript
const weatherAgent = new ComposableAgent({
  name: 'Weather Agent',
  instructions: 'Provide weather information and activity suggestions.',
  model: openai('gpt-4o-mini'),
  tools: { weatherTool },
  memory: new Memory({
    storage: new LibSQLStore({ url: 'file:./weather.db' })
  })
});

const result = await weatherAgent.execute('What should I wear today in San Francisco?');
```

### Document Analysis Agent

```typescript
const docAgent = new ComposableAgent({
  name: 'Document Analyzer',
  instructions: 'Analyze and summarize documents.',
  model: openai('gpt-4o-mini'),
  tools: { processDocumentTool },
  memory: createInMemoryMemory()
});

const result = await docAgent.execute('Summarize this research paper: [document content]');
```

#### Streaming Responses

```typescript
const result = await agent.execute('Your message', {
  stream: true,
  callback: async (chunk) => {
    console.log('Chunk:', chunk.content);
    if (chunk.type === 'tool_call') {
      console.log('Calling tool:', chunk.tool_call?.function.name);
    }
  }
});
```

## Workflow System

Create complex multi-agent workflows with conditional logic, parallel processing, and data transformation:

```typescript
import { 
  createWorkflow, 
  createAgentStep, 
  createTransformStep, 
  createConditionalStep 
} from '@codebolt/agent/composable';

const contentWorkflow = createWorkflow({
  name: 'Content Creation Pipeline',
  initialData: { topic: 'AI in Healthcare' },
  steps: [
    // Step 1: Research
    createAgentStep({
      id: 'research',
      name: 'Research Topic',
      agent: researchAgent,
      messageTemplate: 'Research comprehensive information about: {{topic}}',
      outputMapping: { 'researchData': 'agentResult.message' }
    }),
    
    // Step 2: Write initial draft
    createAgentStep({
      id: 'write',
      name: 'Write Article',
      agent: writingAgent,
      messageTemplate: 'Write an article about {{topic}} using this research: {{researchData}}',
      outputMapping: { 'draft': 'agentResult.message' }
    }),
    
    // Step 3: Review quality
    createAgentStep({
      id: 'review',
      name: 'Review Content',
      agent: reviewAgent,
      messageTemplate: 'Review this article and rate quality 1-10: {{draft}}',
      outputMapping: { 'reviewScore': 'agentResult.message' }
    }),
    
    // Step 4: Conditional improvement
    createConditionalStep({
      id: 'improve-check',
      name: 'Quality Gate',
      condition: (context) => extractScore(context.data.reviewScore) < 8,
      trueBranch: [
        createAgentStep({
          id: 'improve',
          name: 'Improve Content',
          agent: writingAgent,
          messageTemplate: 'Improve this article based on review: {{reviewScore}}\n\nArticle: {{draft}}'
        })
      ]
    })
  ]
});

// Execute workflow
const result = await contentWorkflow.execute();
console.log('Final article:', result.data.improvedArticle || result.data.draft);
```

### Parallel Processing

Run multiple agents simultaneously:

```typescript
const analysisWorkflow = createWorkflow({
  name: 'Parallel Analysis',
  steps: [
    // These run in parallel
    createAgentStep({
      id: 'sentiment',
      name: 'Sentiment Analysis',
      agent: sentimentAgent,
      parallel: true,
      messageTemplate: 'Analyze sentiment: {{text}}'
    }),
    createAgentStep({
      id: 'keywords',
      name: 'Extract Keywords',
      agent: keywordAgent,
      parallel: true,
      messageTemplate: 'Extract keywords: {{text}}'
    }),
    
    // This waits for both parallel steps
    createTransformStep({
      id: 'combine',
      name: 'Combine Results',
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
```

### Error Handling and Retries

```typescript
createAgentStep({
  id: 'api-call',
  name: 'External API Call',
  agent: apiAgent,
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential'  // 1s, 2s, 4s delays
  },
  messageTemplate: 'Call external API with: {{data}}'
})
```

For detailed workflow documentation, see [WORKFLOW.md](./WORKFLOW.md).

## Built-in Tools

The framework includes default tools:

- **attempt_completion**: Mark task as completed
- **ask_followup_question**: Ask user for more information

## Advanced Usage

### Custom Storage Provider

```typescript
class MyCustomStore implements StorageProvider {
  async get(key: string): Promise<any> { /* implementation */ }
  async set(key: string, value: any): Promise<void> { /* implementation */ }
  async delete(key: string): Promise<void> { /* implementation */ }
  async keys(): Promise<string[]> { /* implementation */ }
  async clear(): Promise<void> { /* implementation */ }
}

const memory = new Memory({
  storage: new MyCustomStore()
});
```

### Multiple Conversation Support

```typescript
// Save/load different conversations
memory.setConversationKey('user-123-session-1');
await agent.loadConversation();

// List all conversations
const conversations = await memory.listConversations();
```

### Dynamic Tool Management

```typescript
// Add tools at runtime
agent.addTool('new-tool', myNewTool);

// Remove tools
agent.removeTool('old-tool');

// Get available tools
const tools = agent.getTools();
```

## Error Handling

```typescript
const result = await agent.execute('Your message');

if (result.success) {
  console.log('Response:', result.message);
} else {
  console.error('Error:', result.error);
}

// Access full conversation
console.log('Conversation:', result.conversation);
```

## TypeScript Support

Full type safety with TypeScript:

```typescript
// Tool with typed input/output
const typedTool = createTool({
  id: 'typed-tool',
  inputSchema: z.object({
    text: z.string(),
    count: z.number()
  }),
  outputSchema: z.object({
    processed: z.string(),
    metadata: z.record(z.any())
  }),
  execute: async ({ context }) => {
    // context is fully typed!
    const { text, count } = context;
    return {
      processed: text.repeat(count),
      metadata: { originalLength: text.length }
    };
  }
});
```

## Dependencies

The composable pattern requires:
- `zod` - For schema validation
- `@codebolt/codeboltjs` - For LLM integration
- Optional: `@libsql/client` or `better-sqlite3` for SQLite storage

## Comparison with Builder Pattern

| Feature | Composable Pattern | Builder Pattern |
|---------|-------------------|------------------|
| API Style | Simple, declarative | Fluent, imperative |
| Tool Definition | Schema-based with validation | Manual configuration |
| Memory | Built-in with multiple providers | Manual implementation |
| Document Processing | Integrated | Manual |
| Type Safety | Full Zod validation | Manual typing |
| Learning Curve | Low | Medium |

Choose the composable pattern for:
- Rapid prototyping
- Simple agent workflows
- Built-in memory and document processing
- Strong type safety requirements

Choose the builder pattern for:
- Complex agent workflows
- Full control over execution
- Custom conversation management
- Integration with existing CodeBolt infrastructure
