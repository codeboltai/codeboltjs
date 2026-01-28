# Unified Agent Framework Documentation

Welcome to the comprehensive documentation for the **Unified Agent Framework** - a powerful, self-contained system for building sophisticated AI agents with advanced capabilities.

## Documentation Structure

### [1. Introduction & Overview](./1-unified.md)
- **What is the Unified Framework?** - Core concepts and benefits
- **Architecture Overview** - Layered system design
- **Core Components** - Agents, Tools, Workflows
- **Getting Started** - Installation and basic examples
- **Available Exports** - Complete list of available APIs

### [2. Agents](./2-agents.md)
- **Creating Agents** - Using `CodeboltAgent` and `Agent` classes
- **Agent Execution** - Running agents with messages
- **Agent Configuration** - Tools and processor setup
- **Agent Patterns** - Specialist agents and best practices
- **Available Processors** - Complete list of processors by category

### [3. Tools](./3-tools.md)
- **Creating Tools** - Using `createTool()` and `Tool` class
- **Tool Configuration** - Input schemas with Zod
- **Tool Execution** - Direct execution and error handling
- **OpenAI Format** - Converting tools for LLM APIs
- **Advanced Features** - Tool chaining, async tools, caching

### [4. Processors](./4-processors.md)
- **Processor Categories** - Message modifiers, inference processors, tool processors
- **Available Processors** - Complete reference for all processors
- **Using Processors** - Configuration in agents
- **Execution Flow** - How processors interact

### [5. Examples & Best Practices](./5-examples-and-best-practices.md)
- **Complete Applications** - Customer support, content creation, data analysis
- **Best Practices** - Agent design, tool organization, error handling
- **Testing Strategies** - Unit and integration testing
- **Debugging** - Using ChatRecordingModifier

### [6. Roadmap](./6-roadmap.md)
- **Future Features** - Planned but not yet implemented APIs
- **Orchestrator System** - Coming soon
- **Advanced Processors** - Coming soon
- **Built-in Tools** - Coming soon

## Quick Start

```typescript
import { CodeboltAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

// Create a simple tool
const weatherTool = createTool({
  id: 'weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ input }) => ({
    location: input.location,
    temperature: '72°F',
    condition: 'Sunny'
  })
});

// Create an agent
const weatherAgent = new CodeboltAgent({
  instructions: 'You help users get weather information.',
  tools: [weatherTool]
});

// Use the agent
const result = await weatherAgent.execute({
  role: 'user',
  content: 'What\'s the weather in New York?'
});
console.log(result);
```

## Framework Architecture

The Unified Framework is built on a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     WORKFLOW LAYER                          │
│   Structured multi-step processes with context management   │
├─────────────────────────────────────────────────────────────┤
│                      AGENT LAYER                            │
│    Intelligent agents with conversation management          │
├─────────────────────────────────────────────────────────────┤
│                      TOOL LAYER                             │
│         Individual functions and capabilities               │
├─────────────────────────────────────────────────────────────┤
│                   PROCESSOR LAYER                           │
│     Extensible components for customizing behavior          │
└─────────────────────────────────────────────────────────────┘
```

## Available Processors

All processors are imported from `@codebolt/agent/processor-pieces`:

### Message Modifiers
- `EnvironmentContextModifier` - Add environment context
- `CoreSystemPromptModifier` - Core system prompt handling
- `DirectoryContextModifier` - Working directory context
- `IdeContextModifier` - IDE integration context
- `AtFileProcessorModifier` - Process @file references
- `ArgumentProcessorModifier` - Process arguments
- `MemoryImportModifier` - Import memory context
- `ToolInjectionModifier` - Inject tool descriptions
- `ChatRecordingModifier` - Record chat history
- `ChatHistoryMessageModifier` - Include chat history

### PreInference Processors
- `ChatCompressionModifier` - Compress chat history

### PostInference Processors
- `LoopDetectionModifier` - Detect execution loops

### PreToolCall Processors
- `ToolParameterModifier` - Modify tool parameters
- `ToolValidationModifier` - Validate tool calls

### PostToolCall Processors
- `ConversationCompactorModifier` - Compact conversations
- `ShellProcessorModifier` - Process shell output

## Key Features

- **Self-Contained** - All dependencies are internal
- **Type-Safe** - Full TypeScript support with Zod validation
- **Extensible** - Custom processors, tools, and workflows
- **Production-Ready** - Comprehensive error handling

## Learning Path

1. **Start Here**: Read the [Introduction & Overview](./1-unified.md)
2. **Build Your First Agent**: Follow the [Agents](./2-agents.md) guide
3. **Add Custom Tools**: Learn about [Tools](./3-tools.md)
4. **Enhance with Processors**: Explore [Processors](./4-processors.md)
5. **Build Complete Systems**: Study [Examples & Best Practices](./5-examples-and-best-practices.md)

---

**Ready to build powerful AI agents?** Start with the [Introduction & Overview](./1-unified.md)!
