# @geminiagent/core

A Gemini AI Agent built on top of the Agent Processor Framework with reusable components from `@agentProcessorPieces/core`.

## Overview

This package provides a complete Gemini AI agent implementation that leverages:
- **@codebolt/agentprocessorframework**: Core framework for building AI agents
- **@agentProcessorPieces/core**: Reusable processors, message modifiers, and tools

## Architecture

```
User Message → MessageModifiers → Processors → AgentStep → ToolExecution → Response
```

### Core Components

1. **MessageModifiers**: Transform user input into proper message format
2. **Processors**: Handle input validation, loop detection, session management, and chat compression
3. **AgentStep**: Analyze messages and determine if tools are needed
4. **ToolList**: Manage available tools (built-in and custom)
5. **ToolExecutor**: Execute tools with retry logic and error handling

## Installation

```bash
npm install @geminiagent/core
# or
pnpm add @geminiagent/core
```

## Dependencies

- `@codebolt/agentprocessorframework`: Core framework interfaces and base classes
- `@agentProcessorPieces/core`: Reusable processor pieces, message modifiers, and tools

## Usage

### Basic Setup

```typescript
import { GeminiAgent } from '@geminiagent/core';

const agent = new GeminiAgent({
    maxLoops: 3,
    maxSessionTurns: 10,
    compressionThreshold: 20,
    googleSearchEnabled: false,
    toolRetries: 2,
    model: 'gemini-pro',
    maxTokens: 1000,
    temperature: 0.7
});

// Process a message with full automation
const response = await agent.processMessage('Hello, how can you help me?');
```

### Advanced Control

```typescript
import { GeminiAgent } from '@geminiagent/core';

const agent = new GeminiAgent();

// Process step by step (returns tool calls without executing them)
const stepResponse = await agent.processMessageStepByStep('Read the file config.json');

// Execute specific tool calls manually
const toolResults = await agent.executeToolCalls([
    { tool: 'FileRead', parameters: { filePath: 'config.json' } }
]);

// Continue processing after tool execution
const finalResponse = await agent.continueAfterToolExecution(stepResponse);
```

### Custom Tools

```typescript
import { GeminiAgent } from '@geminiagent/core';
import { BaseTool } from '@codebolt/agentprocessorframework';

class CustomTool extends BaseTool {
    constructor() {
        super('CustomTool', 'Description', { param: 'type' });
    }

    async execute(params: any): Promise<any> {
        return `Processed: ${params.param}`;
    }
}

const agent = new GeminiAgent();
agent.addCustomTool(new CustomTool());
```

## API Reference

### GeminiAgent Constructor Options

- `maxLoops`: Maximum number of loops per prompt (default: 3)
- `maxSessionTurns`: Maximum session turns (default: 10)
- `compressionThreshold`: Chat compression threshold (default: 20)
- `googleSearchEnabled`: Enable Google search for URLs (default: false)
- `toolRetries`: Number of tool execution retries (default: 2)
- `abortOnAbortSignal`: Abort on abort signal (default: true)
- `model`: Gemini model to use (default: 'gemini-pro')
- `maxTokens`: Maximum tokens for responses (default: 1000)
- `temperature`: Response temperature (default: 0.7)

### Main Methods

- `processMessage(userMessage, context?, abortSignal?)`: Full automation
- `processMessageStepByStep(userMessage, context?, abortSignal?)`: Step-by-step processing
- `processMessageWithTools(userMessage, context?, abortSignal?)`: With tool execution but no looping
- `executeToolCalls(toolCalls, context?, abortSignal?)`: Execute specific tool calls
- `continueAfterToolExecution(currentMessage, context?, abortSignal?)`: Continue after tool execution

### Utility Methods

- `addCustomTool(tool)`: Add custom tool
- `removeCustomTool(toolName)`: Remove custom tool
- `getAvailableTools()`: Get list of available tools
- `resetSession()`: Reset session state
- `getAgentStep()`: Get the agent step component
- `getToolExecutor()`: Get the tool executor component
- `getToolList()`: Get the tool list component

## Built-in Tools

The agent comes with a comprehensive set of file manipulation tools:

- **FileRead**: Read file contents
- **FileWrite**: Write content to files
- **FileDelete**: Delete files
- **FileMove**: Move files between locations
- **FileCopy**: Copy files between locations

## Reusable Components

This package leverages the following reusable components from `@agentProcessorPieces/core`:

### Processors
- `ChatCompressionProcessor`: Automatically compresses chat history
- `LoopDetectorProcessor`: Detects and prevents infinite loops
- `SessionTurnProcessor`: Manages session turn limits

### Message Modifiers
- `HandleUrlMessageModifier`: Detects URLs and adds context

### Tools
- Complete set of file manipulation tools

## Development

### Building

```bash
npm run build
# or
pnpm build
```

### Development Mode

```bash
npm run dev
# or
pnpm dev
```

### Clean

```bash
npm run clean
# or
pnpm clean
```

## Example

See `src/example.ts` for a complete usage example.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.