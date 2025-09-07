# Unified Agent Framework Documentation

Welcome to the comprehensive documentation for the **Unified Agent Framework** - a powerful, self-contained system for building sophisticated AI agents with advanced capabilities.

## 📚 Documentation Structure

### [1. Introduction & Overview](./1-unified.md)
- **What is the Unified Framework?** - Core concepts and benefits
- **Architecture Overview** - Layered system design
- **Core Components** - Agents, Tools, Workflows, Orchestrators
- **Getting Started** - Installation and basic examples
- **Key Benefits** - Why choose the Unified Framework

### [2. Agents](./2-agents.md)
- **Creating Agents** - Agent configuration and setup
- **Agent Execution** - Running agents with various options
- **Agent as a Tool** - Converting agents for use by other agents
- **Managing Agent Tools** - Dynamic tool management
- **Agent Workflows** - Workflow integration
- **Advanced Features** - Context management, error handling, monitoring
- **Agent Patterns** - Specialist, supervisor, and multi-modal agents

### [3. Tools](./3-tools.md)
- **Creating Tools** - Basic and specialized tool creation
- **Tool Types** - Text, file, HTTP, validation, and transform tools
- **Tool Execution** - Direct execution and error handling
- **Built-in Tools** - File operations, web tools, and more
- **Advanced Features** - Tool chaining, conditional execution, async operations
- **Tool Testing** - Unit and integration testing strategies
- **Performance Optimization** - Caching, batching, and optimization techniques

### [4. Processors](./4-processors.md)
- **Processor Categories** - Message, conversation, tool, monitoring, and context processors
- **Message Processors** - URL handling, context enhancement, image processing
- **Conversation Management** - Compaction, continuity, and follow-up enhancement
- **Tool Execution Processors** - Validation, interception, and parameter modification
- **System Monitoring** - Loop detection, token management, telemetry
- **Context Management** - Persistent context and memory management
- **Custom Processors** - Creating your own processors
- **Configuration Best Practices** - Environment-specific setups

### [5. Examples & Best Practices](./5-examples-and-best-practices.md)
- **Complete Applications** - Customer support, content creation, data analysis
- **Best Practices** - Agent design, tool organization, workflow patterns
- **Error Handling** - Comprehensive error management strategies
- **Performance Optimization** - Resource management and parallel execution
- **Testing Strategies** - Unit, integration, and end-to-end testing
- **Monitoring & Observability** - Production monitoring and health checks
- **Migration Guide** - Moving from other agent patterns

## 🚀 Quick Start

```typescript
import { createAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

// Create a simple tool
const weatherTool = createTool({
  id: 'weather',
  name: 'Get Weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ input }) => ({ 
    location: input.location,
    temperature: '72°F',
    condition: 'Sunny'
  })
});

// Create an agent
const weatherAgent = createAgent({
  name: 'Weather Assistant',
  instructions: 'You help users get weather information.',
  tools: [weatherTool]
});

// Use the agent
const result = await weatherAgent.execute('What\'s the weather in New York?');
console.log(result.response);
```

## 🏗️ Framework Architecture

The Unified Framework is built on a layered architecture that provides maximum flexibility and scalability:

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR LAYER                       │
│  🎯 Dynamic coordination of agents, workflows, and tools    │
├─────────────────────────────────────────────────────────────┤
│                     WORKFLOW LAYER                          │
│  📋 Structured multi-step processes with dependencies       │
├─────────────────────────────────────────────────────────────┤
│                      AGENT LAYER                            │
│  🤖 Intelligent agents with conversation management         │
├─────────────────────────────────────────────────────────────┤
│                      TOOL LAYER                             │
│  🔧 Individual functions and capabilities                   │
├─────────────────────────────────────────────────────────────┤
│                   PROCESSOR LAYER                           │
│  ⚙️ Extensible components for customizing behavior          │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Available Processors

The framework includes comprehensive processors from the `@processor-pieces` library:

### Message Processors
- **HandleUrlMessageModifier** - Extract content from URLs
- **BaseContextMessageModifier** - Add contextual information
- **WorkingDirectoryMessageModifier** - Include directory context
- **BaseSystemInstructionMessageModifier** - Enhance system instructions
- **ImageAttachmentMessageModifier** - Process image attachments
- **AddToolsListMessageModifier** - Add available tools list

### Conversation Management
- **ConversationCompactorProcessor** - Compact long conversations
- **FollowUpConversationProcessor** - Enhance follow-up conversations
- **ConversationContinuityProcessor** - Maintain conversation continuity
- **ChatCompressionProcessor** - Compress chat history

### Tool Execution
- **LocalToolInterceptorProcessor** - Intercept and handle custom tools
- **ToolValidationProcessor** - Validate tool inputs and outputs
- **ToolParameterModifierProcessor** - Modify tool parameters

### System Monitoring
- **LoopDetectionProcessor** - Detect and prevent infinite loops
- **AdvancedLoopDetectionProcessor** - Advanced semantic loop detection
- **TokenManagementProcessor** - Manage token usage
- **ResponseValidationProcessor** - Validate response quality
- **TelemetryProcessor** - Collect telemetry and metrics
- **ChatRecordingProcessor** - Record conversations

### Context Management
- **ContextManagementProcessor** - Comprehensive context management

### Built-in Tools
- **FileReadTool, FileWriteTool, FileDeleteTool** - File operations
- **FileMoveTool, FileCopyTool** - File management

## 🎯 Key Features

### ✅ **Self-Contained**
- All dependencies are internal
- No external package dependencies
- Works out of the box

### ✅ **Type-Safe**
- Full TypeScript support
- Comprehensive type definitions
- Runtime validation with Zod

### ✅ **Extensible**
- Custom processors
- Custom tools
- Custom workflows
- Plugin architecture

### ✅ **Production-Ready**
- Comprehensive error handling
- Performance monitoring
- Resource management
- Health checks

### ✅ **Developer-Friendly**
- Intuitive APIs
- Extensive documentation
- Rich examples
- Testing utilities

## 🛠️ Use Cases

The Unified Framework is perfect for:

- **Customer Support Systems** - Multi-agent support with escalation
- **Content Creation Pipelines** - Research, writing, and editing workflows
- **Data Analysis Platforms** - Collection, analysis, and reporting
- **Multi-Domain Applications** - Specialized agents for different domains
- **Complex Orchestration** - Dynamic resource coordination
- **Workflow Automation** - Structured multi-step processes

## 📖 Learning Path

1. **Start Here**: Read the [Introduction & Overview](./1-unified.md)
2. **Build Your First Agent**: Follow the [Agents](./2-agents.md) guide
3. **Add Custom Tools**: Learn about [Tools](./3-tools.md)
4. **Enhance with Processors**: Explore [Processors](./4-processors.md)
5. **Build Complete Systems**: Study [Examples & Best Practices](./5-examples-and-best-practices.md)

## 🤝 Support

- **Documentation**: Comprehensive guides and examples
- **Examples**: Real-world application examples
- **Best Practices**: Production-ready patterns
- **Migration Guide**: Moving from other frameworks

## 🔄 Migration

Moving from other agent patterns? Check out our [Migration Guide](./5-examples-and-best-practices.md#migration-guide) for step-by-step instructions on migrating from:

- ComposableAgent pattern
- Builder pattern  
- Processor pattern
- Custom implementations

---

**Ready to build powerful AI agents?** Start with the [Introduction & Overview](./1-unified.md) and begin your journey with the Unified Agent Framework!
