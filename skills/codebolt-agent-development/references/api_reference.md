# Codebolt Agent API Reference

## Table of Contents
1. [Core Classes](#core-classes)
2. [Message Modifiers](#message-modifiers)
3. [Processors](#processors)
4. [Tool Creation](#tool-creation)
5. [Workflow API](#workflow-api)
6. [Type Definitions](#type-definitions)

---

## Core Classes

### CodeboltAgent

The recommended high-level agent class with built-in defaults.

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

interface CodeboltAgentConfig {
  instructions?: string;           // System prompt
  processors?: {
    messageModifiers?: MessageModifier[];
    preInferenceProcessors?: PreInferenceProcessor[];
    postInferenceProcessors?: PostInferenceProcessor[];
    preToolCallProcessors?: PreToolCallProcessor[];
    postToolCallProcessors?: PostToolCallProcessor[];
  };
  enableLogging?: boolean;
}

// Methods
agent.processMessage(message: FlatUserMessage): Promise<AgentExecutionResult>
```

### Agent

Lower-level agent with more control over execution.

```typescript
import { Agent } from '@codebolt/agent/unified';

// Same config as CodeboltAgent
agent.execute(message: FlatUserMessage): Promise<AgentExecutionResult>
```

### InitialPromptGenerator

Orchestrates message modifiers to transform user input.

```typescript
import { InitialPromptGenerator } from '@codebolt/agent/unified';

const generator = new InitialPromptGenerator({
  processors: messageModifiers[]
});

generator.processMessage(message: FlatUserMessage): Promise<ProcessedMessage>
```

### AgentStep

Executes LLM inference with pre/post processing.

```typescript
import { AgentStep } from '@codebolt/agent/unified';

const step = new AgentStep({
  preInferenceProcessors: PreInferenceProcessor[],
  postInferenceProcessors: PostInferenceProcessor[]
});

step.executeStep(
  originalMessage: FlatUserMessage,
  processedMessage: ProcessedMessage
): Promise<UnifiedStepOutput>
```

### ResponseExecutor

Handles tool execution and conversation management.

```typescript
import { ResponseExecutor } from '@codebolt/agent/unified';

const executor = new ResponseExecutor({
  preToolCallProcessors: PreToolCallProcessor[],
  postToolCallProcessors: PostToolCallProcessor[]
});

executor.executeResponse(input: UnifiedResponseInput): Promise<UnifiedResponseOutput>
```

---

## Message Modifiers

All modifiers extend `BaseMessageModifier` and implement:

```typescript
abstract modify(
  originalRequest: FlatUserMessage,
  createdMessage: ProcessedMessage
): Promise<ProcessedMessage>
```

### CoreSystemPromptModifier

Injects system instructions and user memory.

```typescript
import { CoreSystemPromptModifier } from '@codebolt/agent/processor-pieces';

new CoreSystemPromptModifier({
  customSystemPrompt?: string;      // Override default system prompt
  includeUserMemory?: boolean;      // Default: true
  memoryKey?: string;               // Memory storage key
})
```

### ChatHistoryMessageModifier

Appends conversation history.

```typescript
import { ChatHistoryMessageModifier } from '@codebolt/agent/processor-pieces';

new ChatHistoryMessageModifier({
  enableChatHistory?: boolean;      // Default: true
  maxHistoryMessages?: number;      // Default: 20
  includeSystemMessages?: boolean;  // Default: true
})
```

### ToolInjectionModifier

Injects available tools into the message.

```typescript
import { ToolInjectionModifier } from '@codebolt/agent/processor-pieces';

new ToolInjectionModifier({
  toolsLocation?: 'Tool' | 'SystemMessage' | 'InsidePrompt';  // Default: 'Tool'
  includeToolDescriptions?: boolean;  // Default: true
  maxToolsInMessage?: number;         // Default: 30
  giveToolExamples?: boolean;         // Default: false
  toolFilter?: (tool: Tool) => boolean;  // Optional filter
})
```

### EnvironmentContextModifier

Adds environment information (OS, date, time).

```typescript
import { EnvironmentContextModifier } from '@codebolt/agent/processor-pieces';

new EnvironmentContextModifier({
  includeOS?: boolean;        // Default: true
  includeDateTime?: boolean;  // Default: true
  includeTimezone?: boolean;  // Default: true
})
```

### DirectoryContextModifier

Adds project directory structure.

```typescript
import { DirectoryContextModifier } from '@codebolt/agent/processor-pieces';

new DirectoryContextModifier({
  maxDepth?: number;           // Directory traversal depth
  includeHidden?: boolean;     // Include hidden files
  excludePatterns?: string[];  // Glob patterns to exclude
})
```

### IdeContextModifier

Adds IDE state context.

```typescript
import { IdeContextModifier } from '@codebolt/agent/processor-pieces';

new IdeContextModifier({
  includeActiveFile?: boolean;      // Current file in editor
  includeOpenFiles?: boolean;       // All open tabs
  includeCursorPosition?: boolean;  // Cursor line/column
  includeSelectedText?: boolean;    // Selected text content
})
```

### AtFileProcessorModifier

Processes @file mentions in user messages.

```typescript
import { AtFileProcessorModifier } from '@codebolt/agent/processor-pieces';

new AtFileProcessorModifier({
  maxFileSize?: number;       // Max bytes to include
  supportedExtensions?: string[];  // File types to process
})
```

### MemoryImportModifier

Imports stored user/project memory.

```typescript
import { MemoryImportModifier } from '@codebolt/agent/processor-pieces';

new MemoryImportModifier({
  memoryKeys?: string[];      // Keys to import
  scope?: 'user' | 'project' | 'global';
})
```

### ImageAttachmentMessageModifier

Handles image attachments in messages.

```typescript
import { ImageAttachmentMessageModifier } from '@codebolt/agent/processor-pieces';

new ImageAttachmentMessageModifier({
  maxImages?: number;         // Max images to process
  maxImageSize?: number;      // Max bytes per image
})
```

---

## Processors

### BasePreInferenceProcessor

Runs before LLM inference.

```typescript
import { BasePreInferenceProcessor } from '@codebolt/agent/processor-pieces';

class CustomPreProcessor extends BasePreInferenceProcessor {
  async process(
    originalMessage: FlatUserMessage,
    processedMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    // Modify message before LLM call
    return processedMessage;
  }
}
```

### BasePostInferenceProcessor

Runs after LLM response.

```typescript
import { BasePostInferenceProcessor } from '@codebolt/agent/processor-pieces';

class CustomPostProcessor extends BasePostInferenceProcessor {
  async process(
    llmResponse: LLMCompletion,
    context: ProcessingContext
  ): Promise<LLMCompletion> {
    // Validate or modify LLM response
    return llmResponse;
  }
}
```

### BasePreToolCallProcessor

Validates/intercepts tool calls before execution.

```typescript
import { BasePreToolCallProcessor } from '@codebolt/agent/processor-pieces';

class CustomToolValidator extends BasePreToolCallProcessor {
  async process(
    toolCall: ToolCall,
    context: ToolCallContext
  ): Promise<ToolCallDecision> {
    // Return { proceed: true } or { proceed: false, reason: '...' }
    return { proceed: true };
  }
}
```

### BasePostToolCallProcessor

Processes tool results after execution.

```typescript
import { BasePostToolCallProcessor } from '@codebolt/agent/processor-pieces';

class CustomResultProcessor extends BasePostToolCallProcessor {
  async process(
    toolResult: ToolResult,
    context: ToolResultContext
  ): Promise<ToolResult> {
    // Process or transform tool results
    return toolResult;
  }
}
```

### Built-in Processors

```typescript
// Loop detection - prevents infinite tool call loops
import { LoopDetectionModifier } from '@codebolt/agent/processor-pieces';

// Conversation compaction - summarizes long conversations
import { ConversationCompactorModifier } from '@codebolt/agent/processor-pieces';

// Shell command processing
import { ShellProcessorModifier } from '@codebolt/agent/processor-pieces';

// Tool call validation
import { ToolValidationModifier } from '@codebolt/agent/processor-pieces';
```

---

## Tool Creation

### createTool Function

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const tool = createTool({
  id: string;                    // Unique tool identifier
  description: string;           // What the tool does
  inputSchema: ZodSchema;        // Zod schema for input validation
  outputSchema?: ZodSchema;      // Optional output schema
  execute: async (params: {
    input: T;                    // Validated input
    context: ToolContext;        // Execution context
  }) => Promise<R>;              // Tool result
});
```

### Tool Class

```typescript
import { Tool } from '@codebolt/agent/unified';

const tool = new Tool({
  id: 'my-tool',
  description: 'Does something useful',
  inputSchema: z.object({
    param: z.string()
  }),
  execute: async ({ input }) => {
    return { result: 'success' };
  }
});

// Convert to OpenAI format
const openAITool = tool.toOpenAI();
```

---

## Workflow API

### Workflow Class

```typescript
import { Workflow } from '@codebolt/agent/unified';

const workflow = new Workflow({
  name: string;
  description?: string;
  steps: WorkflowStep[];
  inputSchema?: ZodSchema;
  outputSchema?: ZodSchema;
});

// Execute workflow
const result = await workflow.executeAsync(initialContext?);
```

### WorkflowStep Interface

```typescript
interface WorkflowStep {
  id: string;
  name?: string;
  description?: string;
  execute: (context: WorkflowContext) => Promise<WorkflowStepResult>;
  condition?: (context: WorkflowContext) => boolean;  // Conditional execution
  onError?: 'continue' | 'stop' | 'retry';
  maxRetries?: number;
}

interface WorkflowStepResult {
  success: boolean;
  data?: any;
  error?: string;
  nextStep?: string;  // Override next step
}
```

### WorkflowResult

```typescript
interface WorkflowResult {
  executionId: string;
  success: boolean;
  data: any;                        // Final context
  stepResults: WorkflowStepOutput[];
  executionTime: number;            // milliseconds
  error?: string;
}
```

---

## Type Definitions

### FlatUserMessage (Input)

```typescript
interface FlatUserMessage {
  userMessage: string;
  threadId: string;
  messageId: string;
  mentionedFiles?: string[];
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}
```

### ProcessedMessage (Internal)

```typescript
interface ProcessedMessage {
  message: {
    messages: MessageObject[];
    tools?: Tool[];
  };
  metadata: {
    originalMessage: FlatUserMessage;
    processedAt: Date;
    modifiersApplied: string[];
    [key: string]: any;
  };
}
```

### MessageObject

```typescript
interface MessageObject {
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string | ContentBlock[];
  tool_call_id?: string;
  tool_calls?: ToolCall[];
  name?: string;
}
```

### AgentExecutionResult

```typescript
interface AgentExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  conversation: MessageObject[];
  toolsExecuted: string[];
  iterationCount: number;
}
```

### LLMCompletion

```typescript
interface LLMCompletion {
  choices: [{
    message: MessageObject;
    finish_reason: 'stop' | 'tool_calls' | 'length';
  }];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

---

## Import Paths

```typescript
// Main unified module
import { Agent, CodeboltAgent, Tool, Workflow, createTool } from '@codebolt/agent/unified';

// Base components
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';

// Message modifiers
import {
  BaseMessageModifier,
  CoreSystemPromptModifier,
  ChatHistoryMessageModifier,
  ToolInjectionModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  AtFileProcessorModifier,
  MemoryImportModifier,
  ImageAttachmentMessageModifier
} from '@codebolt/agent/processor-pieces';

// Base processors
import {
  BasePreInferenceProcessor,
  BasePostInferenceProcessor,
  BasePreToolCallProcessor,
  BasePostToolCallProcessor
} from '@codebolt/agent/processor-pieces';

// Built-in processors
import {
  LoopDetectionModifier,
  ConversationCompactorModifier,
  ShellProcessorModifier,
  ToolValidationModifier
} from '@codebolt/agent/processor-pieces';
```
