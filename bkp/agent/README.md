# CodeBolt Agent Package

A comprehensive TypeScript framework for building and managing AI agents with CodeBolt. This package provides multiple architectural patterns and utilities to meet different development needs, from simple composable agents to complex multi-step workflows.

## 🚀 Quick Start

```typescript
import { ComposableAgent, createTool } from '@codebolt/agent/composable';
import { z } from 'zod';

// Create a simple weather tool
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({ location: z.string() }),
  outputSchema: z.object({ temperature: z.number(), conditions: z.string() }),
  execute: async ({ context }) => {
    return await getWeatherAPI(context.location);
  },
});

// Create and run agent
const agent = new ComposableAgent({
  name: 'Weather Agent',
  instructions: 'You are a helpful weather assistant.',
  model: 'gpt-4o-mini',
  tools: { weatherTool },
  memory: createCodeBoltAgentMemory('weather_agent')
});

const result = await agent.execute('What is the weather in New York?');
```

## ✨ Key Features

- **Multiple Patterns**: Choose between Composable, Builder, and Processor patterns
- **Type Safety**: Full TypeScript support with Zod validation
- **Memory Management**: Persistent conversation storage with CodeBolt integration
- **Tool System**: Extensible tool framework with validation
- **Workflow Orchestration**: Multi-step agent processes with conditional logic
- **Model Agnostic**: Support for OpenAI, Anthropic, Ollama, and more
- **Stream Support**: Real-time streaming responses

## 📦 Installation

```bash
npm install @codebolt/agent
```

## 📖 Documentation

**📚 [View Complete Documentation](./DOCUMENTATION.md)** - Comprehensive guide with examples, API reference, and best practices

### Quick Links
- [Architectural Patterns](./DOCUMENTATION.md#architectural-patterns) - Choose the right pattern for your use case
- [API Reference](./API_REFERENCE.md) - Complete API documentation  
- [Examples](./EXAMPLES.md) - Real-world usage examples and tutorials
- [Best Practices](./DOCUMENTATION.md#best-practices) - Tips for optimal agent development
- [Migration Guide](./DOCUMENTATION.md#migration-guide) - Upgrading from previous versions

## 🎯 Architecture Patterns

### Composable Pattern (Recommended)
**Best for**: Rapid prototyping, simple agents, beginners

```typescript
import { ComposableAgent, createTool, createCodeBoltAgentMemory } from '@codebolt/agent/composable';

const agent = new ComposableAgent({
  name: 'My Agent',
  instructions: 'You are a helpful assistant.',
  model: 'gpt-4o-mini',
  tools: { myTool },
  memory: createCodeBoltAgentMemory('agent_id')
});

const result = await agent.execute('Help me with this task');
```

### Builder Pattern
**Best for**: Complex workflows, fine-grained control

```typescript
import { Agent, InitialPromptBuilder, LLMOutputHandler } from '@codebolt/agent/builder';

const promptBuilder = new InitialPromptBuilder(userMessage)
  .addSystemInstructions("You are a coding assistant")
  .addFile("./src/main.ts")
  .addTaskDetails("Fix compilation errors");

const prompt = await promptBuilder.build();
const agent = new Agent(tools, systemPrompt);
const result = await agent.runAgent(prompt);
```

### Processor Pattern
**Best for**: Advanced customization, specialized requirements

```typescript
import { BaseProcessor, AgentStep } from '@codebolt/agent/processor';

class CustomProcessor extends BaseProcessor {
  async process(messages: any[]): Promise<any> {
    return this.executeCustomFlow(messages);
  }
}
```

## 🛠️ Available Exports

### Composable Pattern
```typescript
import { 
  ComposableAgent, createTool, createWorkflow,
  Memory, createCodeBoltAgentMemory, MDocument 
} from '@codebolt/agent/composable';
```

### Builder Pattern  
```typescript
import { 
  Agent, InitialPromptBuilder, LLMOutputHandler,
  SystemPrompt, TaskInstruction, UserMessage 
} from '@codebolt/agent/builder';
```

### Processor Pattern
```typescript
import { 
  BaseProcessor, AgentStep, BaseTool,
  ChatCompressionProcessor, LoopDetectionProcessor 
} from '@codebolt/agent/processor';
```

## 🏗️ Workflow System

Create complex multi-agent workflows:

```typescript
const workflow = createWorkflow({
  name: 'Content Pipeline',
  steps: [
    createAgentStep({
      id: 'research', 
      agent: researchAgent,
      messageTemplate: 'Research: {{topic}}'
    }),
    createAgentStep({
      id: 'write',
      agent: writingAgent, 
      messageTemplate: 'Write article: {{researchData}}'
    })
  ]
});

const result = await workflow.execute({ topic: 'AI Ethics' });
```

## 🧠 Memory & Storage

Integrated with CodeBolt's storage system:

```typescript
// Agent-scoped persistent storage
const agentMemory = createCodeBoltAgentMemory('my_agent');

// Project-scoped storage
const projectMemory = createCodeBoltProjectMemory('project_agent');

// Fast access memory database  
const dbMemory = createCodeBoltDbMemory('cache_agent');
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Development mode
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

## 📋 Pattern Comparison

| Pattern | Complexity | Use Case | Learning Curve |
|---------|------------|----------|----------------|
| **Composable** | Low | Rapid prototyping, simple agents | Low |
| **Builder** | Medium | Complex workflows, custom logic | Medium |
| **Processor** | High | Advanced customization | High |

## 🤝 Contributing

See our [Contributing Guide](./DOCUMENTATION.md#contributing) for development setup, coding standards, and submission guidelines.

## 📄 License

MIT - See the main CodeBolt repository for details.

---

**📚 [Complete Documentation](./DOCUMENTATION.md)** | **🐛 [Report Issues](https://github.com/codeboltai/codeboltjs/issues)** | **💬 [Join Community](https://discord.gg/codebolt)**
