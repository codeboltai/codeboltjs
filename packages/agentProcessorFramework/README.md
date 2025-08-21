# @codebolt/agentprocessorframework

A reusable framework for building AI agents with processors, message modifiers, tools, and orchestration.

## Overview

This framework provides the core building blocks for creating AI agents with a clean, modular architecture. It separates concerns into distinct components that can be extended and customized for specific use cases.

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

## Features

- **Modular Design**: Clean separation of concerns with extensible components
- **TypeScript**: Full type safety and IntelliSense support
- **Abstract Base Classes**: Easy to extend and customize
- **Tool Management**: Built-in tool registration and execution
- **Retry Logic**: Automatic retry for failed tool executions
- **Abort Support**: Can be cancelled mid-execution

## Installation

```bash
npm install @codebolt/agentprocessorframework
# or
pnpm add @codebolt/agentprocessorframework
```

## Usage

### Basic Structure

```typescript
import { 
    BaseProcessor, 
    BaseMessageModifier, 
    BaseTool, 
    AgentStep, 
    ToolExecutor, 
    ToolList 
} from '@codebolt/agentprocessorframework';

// Extend base classes to create your specific implementations
class MyProcessor extends BaseProcessor {
    async *processInput(input: ProcessorInput) {
        // Your processing logic here
        yield* this.yieldEvent('CustomEvent', { data: 'value' });
    }
}

class MyMessageModifier extends BaseMessageModifier {
    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        // Your modification logic here
        return input.createdMessage;
    }
}

class MyTool extends BaseTool {
    constructor() {
        super('MyTool', 'Description', { param: 'type' });
    }

    async execute(params: any): Promise<any> {
        // Your tool logic here
        return 'result';
    }
}
```

### Creating a Custom Agent

```typescript
import { AgentStep, ProcessedMessage, ToolList } from '@codebolt/agentprocessorframework';

class MyAgentStep extends AgentStep {
    protected async analyzeForToolCalls(
        messages: ProcessedMessage, 
        tools: ToolList, 
        context?: Record<string, any>
    ): Promise<Array<{ tool: string; parameters: any }>> {
        // Implement your tool analysis logic
        // This is where you'd use an LLM to determine tool calls
        return [];
    }

    protected async generateFinalResponse(
        messages: ProcessedMessage, 
        context?: Record<string, any>
    ): Promise<ProcessedMessage> {
        // Implement your response generation logic
        // This is where you'd use an LLM to generate responses
        return messages;
    }
}
```

### Using the Framework

```typescript
import { ToolList, ToolExecutor } from '@codebolt/agentprocessorframework';

// Create tool list
const toolList = new ToolList({
    inbuiltTools: [new MyTool()],
    customTools: []
});

// Create tool executor
const toolExecutor = new ToolExecutor(toolList, {
    noOfTries: 3,
    abortOnAbortSignal: true
});

// Create agent step
const agentStep = new MyAgentStep();

// Use the framework
const result = await agentStep.loop({
    messages: { messages: [{ role: 'user', content: 'Hello' }] },
    tools: toolList
}, toolExecutor);
```

## API Reference

### Base Classes

#### BaseProcessor
- `processInput(input: ProcessorInput)`: Abstract method to implement
- `setContext(key: string, value: any)`: Set context value
- `getContext(key: string)`: Get context value
- `clearContext()`: Clear all context
- `yieldEvent(type: string, value?, metadata?)`: Helper to yield events

#### BaseMessageModifier
- `modify(input: MessageModifierInput)`: Abstract method to implement
- `setContext(key: string, value: any)`: Set context value
- `getContext(key: string)`: Get context value
- `clearContext()`: Clear all context

#### BaseTool
- `execute(params: any, abortSignal?)`: Abstract method to implement
- `validateParameters(params: any)`: Override for custom validation
- `checkAbortSignal(abortSignal?)`: Check if execution was aborted

### Core Classes

#### AgentStep
- `generateOneStep(input)`: Generate step without tool execution
- `generateWithToolExecution(input, toolExecutor)`: Generate step with tool execution
- `loop(input, toolExecutor, maxIterations?)`: Complete loop with tool execution

#### ToolExecutor
- `execute(input: ToolExecutionInput)`: Execute tool calls with retry logic
- `addCustomTool(tool)`: Add custom tool
- `removeCustomTool(name)`: Remove custom tool
- `getAvailableTools()`: Get list of available tools

#### ToolList
- `getTool(name)`: Get tool by name
- `getAllTools()`: Get all tools
- `addCustomTool(tool)`: Add custom tool
- `removeCustomTool(name)`: Remove custom tool
- `getToolNames()`: Get tool names

## Extending the Framework

### Adding New Processors

```typescript
import { BaseProcessor, ProcessorInput, ProcessorOutput } from '@codebolt/agentprocessorframework';

class CustomProcessor extends BaseProcessor {
    constructor(private readonly customOption: string) {
        super({ customOption });
    }

    async *processInput(input: ProcessorInput): AsyncGenerator<ProcessorOutput, void, unknown> {
        // Your custom processing logic
        yield* this.yieldEvent('CustomProcessed', { 
            option: this.customOption,
            message: input.message 
        });
    }
}
```

### Adding New Message Modifiers

```typescript
import { BaseMessageModifier, MessageModifierInput, ProcessedMessage } from '@codebolt/agentprocessorframework';

class CustomModifier extends BaseMessageModifier {
    constructor(private readonly transformFunction: (content: string) => string) {
        super();
    }

    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        const transformedContent = this.transformFunction(input.createdMessage.messages[0].content);
        
        return {
            messages: [
                { ...input.createdMessage.messages[0], content: transformedContent }
            ],
            metadata: { ...input.createdMessage.metadata, transformed: true }
        };
    }
}
```

### Adding New Tools

```typescript
import { BaseTool } from '@codebolt/agentprocessorframework';

class CustomTool extends BaseTool {
    constructor() {
        super('CustomTool', 'Description of custom tool', {
            param1: { type: 'string', required: true },
            param2: { type: 'number', required: false }
        });
    }

    async execute(params: any, abortSignal?: AbortSignal): Promise<any> {
        await this.checkAbortSignal(abortSignal);
        
        if (!this.validateParameters(params)) {
            throw new Error('Invalid parameters');
        }

        // Your tool logic here
        return `Processed: ${params.param1}`;
    }

    protected validateParameters(params: any): boolean {
        return params.param1 && typeof params.param1 === 'string';
    }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
