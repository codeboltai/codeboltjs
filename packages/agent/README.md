# CodeBolt Agent Utils

A TypeScript library providing utilities for building and managing AI agents with CodeBolt. This package extracts the agent functionality from the main CodeBolt library into a focused, reusable package.

## Features

- **Agent Class**: Core agent functionality for managing conversations with LLMs
- **Message Builders**: Utilities for building user messages, system prompts, and task instructions
- **Prompt Management**: Advanced prompt building and management capabilities
- **LLM Output Handling**: Processing and managing LLM responses and tool executions
- **Follow-up Questions**: Generate contextual follow-up questions for conversations

## Installation

```bash
npm install @codebolt/agent
```

## Usage

### Basic Agent Setup

```typescript
import { Agent, SystemPrompt, TaskInstruction } from '@codebolt/agent';

// Create a system prompt
const systemPrompt = new SystemPrompt();
await systemPrompt.loadPrompt('./prompts/system.yaml');

// Create a task instruction
const taskInstruction = new TaskInstruction();
await taskInstruction.loadInstruction('./tasks/coding-task.yaml');

// Initialize agent
const agent = new Agent([], systemPrompt);

// Run the agent on a task
const result = await agent.runAgent(taskInstruction);
```

### Building User Messages

```typescript
import { UserMessage } from '@codebolt/agent-utils';

const userMessage = new UserMessage();
await userMessage.addMessage("Please help me with my code");
await userMessage.addFileContent("./src/main.ts");
```

### Advanced Prompt Building

```typescript
import { InitialPromptBuilder } from '@codebolt/agent';

const promptBuilder = new InitialPromptBuilder("Fix the bug in my application");
promptBuilder
  .addSystemInstructions("You are a helpful coding assistant")
  .addFile("./src/problematic-file.ts")
  .addTaskDetails("Find and fix the TypeScript compilation errors");

const prompt = await promptBuilder.build();
```

### LLM Output Handling

```typescript
import { LLMOutputHandler } from '@codebolt/agent';

const outputHandler = new LLMOutputHandler();
const result = await outputHandler.processLLMResponse(llmResponse, tools);
```

## API Reference

### Classes

- `Agent` - Core agent for managing LLM conversations and tool executions
- `UserMessage` - Builder for user messages with file content support
- `SystemPrompt` - Management of system prompts from YAML files
- `TaskInstruction` - Handling of task instructions and metadata
- `InitialPromptBuilder` - Fluent interface for building complex prompts
- `FollowUpPromptBuilder` - Generate follow-up questions for conversations
- `LLMOutputHandler` - Process LLM responses and handle tool executions

### Types

The package exports comprehensive TypeScript types for all interfaces, including:
- `Message`, `ToolResult`, `ToolDetails`
- `OpenAIMessage`, `OpenAITool`, `ConversationEntry`
- `UserMessageContent`, `CodeboltAPI`
- `MCPTool`, `InitialUserMessage`

## Dependencies

This package depends on `@codebolt/codeboltjs` for core functionality like file system operations, LLM communication, and tool execution.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Clean build artifacts
npm run clean
```

## License

MIT

## Contributing

Please see the main CodeBolt repository for contribution guidelines.
