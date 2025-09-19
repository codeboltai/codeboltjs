# Gemini Agent - Unified Framework

A powerful AI agent implementation using Google's Gemini model, built on the **Unified Agent Framework**. This agent provides intelligent assistance with file operations, web browsing, image analysis, and comprehensive conversation management.

## 🚀 Features

- **🤖 Gemini-Powered Intelligence** - Leverages Google's advanced Gemini Pro model
- **📁 File Operations** - Read, write, delete, move, and copy files
- **🌐 Web Content Processing** - Automatically extract and analyze web content from URLs
- **🖼️ Image Analysis** - Process and analyze image attachments
- **💬 Advanced Conversation Management** - Smart conversation compression and continuity
- **🔄 Loop Detection** - Prevents infinite loops with advanced detection algorithms
- **📊 Telemetry & Monitoring** - Comprehensive performance tracking and analytics
- **🛡️ Safety & Validation** - Built-in response validation and safety checks

## 📋 Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Features](#features-detailed)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)
8. [Migration Guide](#migration-guide)

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- TypeScript 5.0+
- Access to Google Gemini API

### Install Dependencies

```bash
# Install the agent package
npm install @codebolt/geminiagent

# Or if developing locally
cd agents/geminiagent
npm install
```

### Build the Agent

```bash
npm run build
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { geminiAgent, executeGeminiAgent } from '@codebolt/geminiagent';

// Execute a simple query
const result = await executeGeminiAgent('Hello, can you help me with my project?');
console.log(result.response);

// Execute with options
const result = await executeGeminiAgent('Analyze this code file', {
  maxIterations: 5,
  includeHistory: true,
  context: {
    projectType: 'web-application',
    language: 'typescript'
  }
});
```

### Using with CodeBolt

The agent automatically integrates with CodeBolt's messaging system:

```typescript
import codebolt from '@codebolt/codeboltjs';
import './agents/geminiagent'; // This registers the message handler

// The agent will automatically handle messages sent through CodeBolt
```

### Custom Configuration

```typescript
import { createAgent } from '@codebolt/geminiagent';

const customGeminiAgent = createAgent({
  name: 'Custom Gemini Assistant',
  instructions: 'You are a specialized coding assistant.',
  llmConfig: {
    model: 'gemini-pro',
    temperature: 0.3, // Lower temperature for more focused responses
    maxTokens: 4096
  },
  maxIterations: 8,
  enableLogging: true
});
```

## ⚙️ Configuration

### Environment Variables

```bash
# Google AI API Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Optional: Custom model configuration
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# Optional: Logging and monitoring
ENABLE_TELEMETRY=true
LOG_LEVEL=info
```

### Agent Configuration Options

```typescript
const agentConfig = {
  // Basic settings
  name: 'Gemini Agent',
  instructions: 'System instructions for the agent',
  description: 'Agent description',
  
  // LLM Configuration
  llmConfig: {
    model: 'gemini-pro',           // Gemini model to use
    temperature: 0.7,              // Response creativity (0-1)
    maxTokens: 8192,               // Maximum response tokens
    topP: 0.9,                     // Nucleus sampling
    topK: 40,                      // Top-K sampling
    stopSequences: ['END']         // Stop generation sequences
  },
  
  // Execution settings
  maxIterations: 10,               // Max tool execution iterations
  maxConversationLength: 50,       // Max conversation history
  enableLogging: true,             // Enable console logging
  
  // Tools and processors are configured automatically
};
```

## 🔧 Features (Detailed)

### File Operations

The agent includes comprehensive file management capabilities:

```typescript
// Examples of what the agent can do:
await geminiAgent.execute('Read the contents of package.json');
await geminiAgent.execute('Create a new file called README.md with project documentation');
await geminiAgent.execute('Delete all .log files in the current directory');
await geminiAgent.execute('Move all images from src/ to assets/images/');
```

**Available File Tools:**
- **FileReadTool** - Read file contents
- **FileWriteTool** - Write/create files
- **FileDeleteTool** - Delete files
- **FileMoveTool** - Move/rename files
- **FileCopyTool** - Copy files

### Web Content Processing

Automatically processes URLs in messages:

```typescript
await geminiAgent.execute('Summarize the content from https://example.com/article');
await geminiAgent.execute('What are the main points in this documentation: https://docs.example.com');
```

**Features:**
- Automatic URL detection and content extraction
- Metadata extraction (title, description, etc.)
- Content summarization and analysis
- Support for various web content types

### Image Analysis

Process and analyze images:

```typescript
// The agent can analyze images attached to messages
await geminiAgent.execute('What do you see in this image?', {
  context: {
    attachments: [{ type: 'image', url: 'path/to/image.jpg' }]
  }
});
```

### Advanced Conversation Management

**Conversation Compaction:**
- Automatically compresses long conversations
- Preserves important context and recent messages
- Configurable compression thresholds

**Loop Detection:**
- Prevents infinite loops in agent execution
- Advanced semantic analysis for loop detection
- Configurable detection thresholds

**Context Management:**
- Maintains project context across conversations
- IDE integration for enhanced context awareness
- Directory and file structure awareness

## 📚 API Reference

### Main Functions

#### `executeGeminiAgent(message, options?)`

Execute the Gemini agent with a message.

```typescript
const result = await executeGeminiAgent(message, {
  maxIterations?: number;
  includeHistory?: boolean;
  context?: Record<string, unknown>;
});
```

**Parameters:**
- `message` (string): The user message to process
- `options` (object, optional):
  - `maxIterations`: Maximum tool execution iterations (default: 10)
  - `includeHistory`: Include conversation history in response (default: false)
  - `context`: Additional context data

**Returns:**
```typescript
{
  success: boolean;
  response?: string;
  error?: string;
  iterations: number;
  toolResults?: ToolResult[];
  conversationHistory?: Message[];
  executionTime: number;
}
```

#### `getGeminiAgentStatus()`

Get the current status and configuration of the Gemini agent.

```typescript
const status = getGeminiAgentStatus();
console.log(status);
// {
//   name: 'Gemini Agent',
//   tools: 5,
//   processors: {
//     messageModifiers: 6,
//     followUpConversation: 8,
//     preToolCall: 1
//   },
//   llmConfig: { model: 'gemini-pro', temperature: 0.7, ... }
// }
```

### Agent Instance Methods

#### `geminiAgent.execute(message, options?)`

Direct execution method on the agent instance.

#### `geminiAgent.addTool(tool)`

Add a custom tool to the agent.

```typescript
import { createTool } from '@codebolt/geminiagent';

const customTool = createTool({
  id: 'custom-calculator',
  name: 'Calculator',
  description: 'Perform mathematical calculations',
  inputSchema: z.object({ expression: z.string() }),
  execute: async ({ input }) => ({ result: eval(input.expression) })
});

geminiAgent.addTool(customTool);
```

#### `geminiAgent.listTools()`

Get a list of all available tools.

#### `geminiAgent.clearConversationHistory()`

Clear the agent's conversation history.

## 💡 Examples

### Basic File Operations

```typescript
// Read and analyze a configuration file
const result = await executeGeminiAgent(
  'Read my package.json file and tell me what dependencies I have'
);

// Create a new component file
await executeGeminiAgent(
  'Create a new React component called UserProfile in src/components/ with basic props and TypeScript'
);

// Organize project files
await executeGeminiAgent(
  'Move all .test.js files to a tests/ directory and update their import paths'
);
```

### Web Content Analysis

```typescript
// Analyze documentation
await executeGeminiAgent(
  'Read this API documentation and create a summary: https://api.example.com/docs'
);

// Compare multiple sources
await executeGeminiAgent(`
  Compare the information from these two articles:
  - https://example1.com/article
  - https://example2.com/article
  
  What are the key differences in their approaches?
`);
```

### Code Analysis and Generation

```typescript
// Code review
await executeGeminiAgent(
  'Review the code in src/utils/helpers.ts and suggest improvements'
);

// Generate tests
await executeGeminiAgent(
  'Generate unit tests for the functions in src/auth/login.ts using Jest'
);

// Refactoring assistance
await executeGeminiAgent(
  'Help me refactor this component to use React hooks instead of class components'
);
```

### Project Management

```typescript
// Project analysis
await executeGeminiAgent(
  'Analyze my project structure and suggest improvements for better organization'
);

// Documentation generation
await executeGeminiAgent(
  'Generate comprehensive README documentation for this project based on the code and package.json'
);

// Dependency management
await executeGeminiAgent(
  'Check for outdated dependencies and suggest updates, considering breaking changes'
);
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Import Errors

**Problem:** Cannot find module '@codebolt/agent/unified'

**Solution:** 
```typescript
// Use relative imports during development
import { createAgent } from '../../../packages/agent/src/unified/index';

// Or ensure the package is properly built and installed
npm run build
```

#### 2. API Key Issues

**Problem:** Gemini API authentication failures

**Solution:**
```bash
# Set your API key
export GOOGLE_AI_API_KEY=your_api_key_here

# Or in your .env file
GOOGLE_AI_API_KEY=your_api_key_here
```

#### 3. Memory Issues

**Problem:** Agent runs out of memory with long conversations

**Solution:**
```typescript
// Configure conversation compaction
const agent = createAgent({
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 20, // Reduce conversation length
        compactionThreshold: 0.6,  // More aggressive compaction
        enableSummarization: true
      })
    ]
  }
});
```

#### 4. Tool Execution Timeouts

**Problem:** Tools taking too long to execute

**Solution:**
```typescript
// Reduce max iterations and add timeouts
const result = await executeGeminiAgent(message, {
  maxIterations: 5,
  timeout: 30000 // 30 seconds
});
```

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
const debugAgent = createAgent({
  name: 'Debug Gemini Agent',
  enableLogging: true,
  logLevel: 'debug',
  processors: {
    followUpConversation: [
      new ChatRecordingProcessor({
        enableRecording: true,
        storageLocation: './debug-logs'
      })
    ]
  }
});
```

### Performance Optimization

For better performance in production:

```typescript
const optimizedAgent = createAgent({
  name: 'Optimized Gemini Agent',
  llmConfig: {
    temperature: 0.3, // Lower temperature for faster responses
    maxTokens: 4096   // Reduce token limit
  },
  maxIterations: 5,   // Reduce max iterations
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 15,
        enableSummarization: false // Disable expensive operations
      }),
      new TokenManagementProcessor({
        maxTokens: 4000,
        enableCompression: true
      })
    ]
  }
});
```

## 🔄 Migration Guide

### From Legacy Processor Pattern

If you're migrating from the old processor-based implementation:

#### Old Implementation
```typescript
// Old way - manual processor management
const messageModifier = new RequestMessage({
  messageModifiers: [/* processors */]
});
const agentStep = new LLMAgentStep({
  inputProcessors: [/* processors */],
  outputProcessors: [/* processors */]
});
```

#### New Implementation
```typescript
// New way - unified agent with integrated processors
const agent = createAgent({
  name: 'Gemini Agent',
  processors: {
    messageModifiers: [/* processors */],
    followUpConversation: [/* processors */],
    preToolCall: [/* processors */]
  }
});
```

### Key Changes

1. **Simplified API**: Single `execute()` method instead of manual step management
2. **Integrated Processors**: All processors configured in agent creation
3. **Better Error Handling**: Comprehensive error management and recovery
4. **Enhanced Monitoring**: Built-in telemetry and performance tracking
5. **Type Safety**: Full TypeScript support with proper type definitions

### Migration Steps

1. **Update Imports**
```typescript
// Old
import { LLMAgentStep, RequestMessage } from '@codebolt/agent/processor';

// New
import { createAgent } from '@codebolt/agent/unified';
```

2. **Convert Agent Creation**
```typescript
// Old - manual setup
const messageModifier = new RequestMessage({...});
const agentStep = new LLMAgentStep({...});

// New - unified creation
const agent = createAgent({...});
```

3. **Update Execution Logic**
```typescript
// Old - manual loop
while (iteration < maxIterations) {
  const response = await agentStep.step(message);
  // Manual tool execution logic
}

// New - automatic execution
const result = await agent.execute(message);
```

4. **Configure Processors**
```typescript
// Old - separate processor instances
const processors = [new SomeProcessor(), new AnotherProcessor()];

// New - organized processor configuration
const agent = createAgent({
  processors: {
    messageModifiers: [new SomeProcessor()],
    followUpConversation: [new AnotherProcessor()]
  }
});
```

## 📊 Performance Metrics

The Gemini agent includes comprehensive performance monitoring:

### Metrics Collected

- **Execution Time** - Total time for request processing
- **Token Usage** - Input and output token consumption
- **Tool Usage** - Number and types of tools executed
- **Iteration Count** - Number of processing iterations
- **Error Rate** - Success/failure statistics
- **Memory Usage** - Memory consumption tracking

### Accessing Metrics

```typescript
const result = await executeGeminiAgent('Your message');

console.log('Performance Metrics:', {
  executionTime: result.executionTime,
  iterations: result.iterations,
  toolsUsed: result.toolResults?.length || 0,
  success: result.success
});
```

### Custom Metrics

Add custom metrics tracking:

```typescript
const agent = createAgent({
  processors: {
    followUpConversation: [
      new TelemetryProcessor({
        customMetrics: {
          'gemini.response.length': (context) => context.response?.length || 0,
          'gemini.user.satisfaction': (context) => context.userFeedback?.rating || 0
        }
      })
    ]
  }
});
```

## 🤝 Contributing

We welcome contributions to improve the Gemini agent! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/codeboltjs.git

# Navigate to the Gemini agent
cd agents/geminiagent

# Install dependencies
npm install

# Start development
npm run dev
```

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Unified Framework Docs](../../documentation/mainfolder/docs/3_CustomAgents/agentPatterns/5-unified/)
- **Issues**: [GitHub Issues](https://github.com/your-org/codeboltjs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/codeboltjs/discussions)

---

**Built with ❤️ using the Unified Agent Framework**