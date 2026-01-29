# Level 2: Base Components

Control the agent loop while using helper classes for message processing, LLM inference, and tool execution.

## Components Overview

```
User Message
    ↓
[InitialPromptGenerator] ← MessageModifiers
    ↓
ProcessedMessage
    ↓
[AgentStep] ← PreInference/PostInference Processors
    ↓
LLM Response
    ↓
[ResponseExecutor] ← PreToolCall/PostToolCall Processors
    ↓
Tool Results / Completion
```

---

## InitialPromptGenerator

Transforms user messages into LLM-ready prompts by applying message modifiers.

### Constructor

```typescript
import { InitialPromptGenerator } from '@codebolt/agent/unified';

const generator = new InitialPromptGenerator({
  processors?: MessageModifier[];        // Modifiers to apply
  baseSystemPrompt?: string;             // System prompt to prepend
  metaData?: Record<string, unknown>;    // Context metadata
  enableLogging?: boolean;               // Enable logging (default: true)
});
```

### Key Method

```typescript
async processMessage(input: FlatUserMessage): Promise<ProcessedMessage>
```

**Processing Flow:**
1. Creates empty `ProcessedMessage`
2. Applies all message modifiers in sequence
3. Adds assistant acknowledgment if needed
4. Retrieves incomplete todos and adds reminder
5. Adds base system prompt if not present
6. Appends user's actual message

### Example

```typescript
import { InitialPromptGenerator } from '@codebolt/agent/unified';
import {
  ChatHistoryMessageModifier,
  CoreSystemPromptModifier,
  ToolInjectionModifier,
  EnvironmentContextModifier
} from '@codebolt/agent/processor-pieces';

const generator = new InitialPromptGenerator({
  processors: [
    new ChatHistoryMessageModifier({ enableChatHistory: true }),
    new EnvironmentContextModifier(),
    new CoreSystemPromptModifier({ customSystemPrompt: 'You are helpful.' }),
    new ToolInjectionModifier({ toolsLocation: 'Tool' })
  ],
  baseSystemPrompt: 'You are an AI coding assistant.',
  enableLogging: true
});

const processed = await generator.processMessage(userMessage);
// processed.message.messages contains all context
// processed.message.tools contains available tools
```

### Management Methods

```typescript
generator.setMetaData(key: string, value: unknown): void
generator.getMetaData(key: string): unknown
generator.clearMetaData(): void
generator.updateProcessors(processors: MessageModifier[]): void
generator.getProcessors(): MessageModifier[]
```

---

## AgentStep

Executes a single LLM inference step with optional pre/post processing.

### Constructor

```typescript
import { AgentStep } from '@codebolt/agent/unified';

const step = new AgentStep({
  preInferenceProcessors?: PreInferenceProcessor[];
  postInferenceProcessors?: PostInferenceProcessor[];
  llmRole?: string;  // LLM configuration (default: 'default')
});
```

### Key Method

```typescript
async executeStep(
  originalRequest: FlatUserMessage,
  createdMessage: ProcessedMessage
): Promise<AgentStepOutput>
```

**Execution Flow:**
1. Apply `preInferenceProcessors` (modify message before LLM)
2. Call `codebolt.llm.inference()`
3. Add LLM response to message history
4. Apply `postInferenceProcessors` (analyze/modify response)

### Output

```typescript
interface AgentStepOutput {
  rawLLMResponse: LLMCompletion;           // Raw LLM response
  nextMessage: ProcessedMessage;            // Updated message history
  actualMessageSentToLLM: ProcessedMessage; // What was sent (for reference)
}
```

### Example

```typescript
import { AgentStep } from '@codebolt/agent/unified';
import { LoopDetectionModifier } from '@codebolt/agent/processor-pieces';

const step = new AgentStep({
  preInferenceProcessors: [],
  postInferenceProcessors: [
    new LoopDetectionModifier({ enableLoopPrevention: true })
  ],
  llmRole: 'default'
});

const result = await step.executeStep(userMessage, processedMessage);

if (result.rawLLMResponse.choices[0].message.tool_calls) {
  // Handle tool calls
} else {
  // Task complete
}
```

### Management Methods

```typescript
step.updatePreInferenceProcessors(processors: PreInferenceProcessor[]): void
step.getPreInferenceProcessors(): PreInferenceProcessor[]
step.updatePostInferenceProcessors(processors: PostInferenceProcessor[]): void
step.getPostInferenceProcessors(): PostInferenceProcessor[]
step.setLLMConfig(config: string): void
step.getLLMConfig(): string
```

---

## ResponseExecutor

Executes tools from LLM response and manages the agent loop continuation.

### Constructor

```typescript
import { ResponseExecutor } from '@codebolt/agent/unified';

const executor = new ResponseExecutor({
  preToolCallProcessors: PreToolCallProcessor[];
  postToolCallProcessors: PostToolCallProcessor[];
});
```

### Key Method

```typescript
async executeResponse(input: ResponseInput): Promise<ResponseOutput>
```

**Input:**
```typescript
interface ResponseInput {
  nextMessage: ProcessedMessage;
  actualMessageSentToLLM: ProcessedMessage;
  rawLLMOutput: LLMCompletion;
  initialUserMessage?: FlatUserMessage;
}
```

**Execution Flow:**
1. Apply `preToolCallProcessors` (filter/modify tool calls)
2. Parse `tool_calls` from LLM response
3. Execute each tool via `codebolt.mcp.executeTool()`
4. Handle special tools: subagents, thread management
5. Collect results and add to conversation
6. Apply `postToolCallProcessors` (process results)

**Output:**
```typescript
interface ResponseOutput {
  completed: boolean;            // Whether task is done
  nextMessage: ProcessedMessage; // Updated message history
  toolResults: ToolResult[];     // Results from tools
  finalMessage?: string;         // Final completion message
}
```

### Example

```typescript
import { ResponseExecutor } from '@codebolt/agent/unified';
import { ShellProcessorModifier } from '@codebolt/agent/processor-pieces';

const executor = new ResponseExecutor({
  preToolCallProcessors: [],
  postToolCallProcessors: [
    new ShellProcessorModifier({ enableShellExecution: true })
  ]
});

const result = await executor.executeResponse({
  nextMessage: stepResult.nextMessage,
  actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
  rawLLMOutput: stepResult.rawLLMResponse,
  initialUserMessage: userMessage
});

if (result.completed) {
  console.log('Done:', result.finalMessage);
} else {
  // Continue loop with result.nextMessage
}
```

---

## Complete Level 2 Agent

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import {
  ChatHistoryMessageModifier,
  CoreSystemPromptModifier,
  ToolInjectionModifier,
  LoopDetectionModifier
} from '@codebolt/agent/processor-pieces';
import codebolt from '@codebolt/codeboltjs';

const MAX_ITERATIONS = 20;

class Level2Agent {
  private promptGen: InitialPromptGenerator;
  private agentStep: AgentStep;
  private responseExec: ResponseExecutor;

  constructor(systemPrompt: string) {
    this.promptGen = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
        new ToolInjectionModifier({ toolsLocation: 'Tool' })
      ]
    });

    this.agentStep = new AgentStep({
      postInferenceProcessors: [new LoopDetectionModifier()]
    });

    this.responseExec = new ResponseExecutor({
      preToolCallProcessors: [],
      postToolCallProcessors: []
    });
  }

  async execute(userMessage: FlatUserMessage) {
    let prompt = await this.promptGen.processMessage(userMessage);

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      // LLM inference
      const stepResult = await this.agentStep.executeStep(userMessage, prompt);

      // Custom logic point: inspect LLM response
      console.log('Iteration:', i, 'Tool calls:',
        stepResult.rawLLMResponse.choices[0].message.tool_calls?.length ?? 0);

      // Tool execution
      const execResult = await this.responseExec.executeResponse({
        nextMessage: stepResult.nextMessage,
        rawLLMOutput: stepResult.rawLLMResponse,
        actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
        initialUserMessage: userMessage
      });

      if (execResult.completed) {
        return execResult.finalMessage;
      }

      prompt = execResult.nextMessage;
    }

    throw new Error('Max iterations reached');
  }
}

// Usage
codebolt.onMessage(async (msg) => {
  const agent = new Level2Agent('You are a coding assistant.');
  const result = await agent.execute(msg);
  codebolt.chat.sendMessage(result);
});
```

---

## Key Types

```typescript
interface ProcessedMessage {
  message: {
    messages: MessageObject[];
    tools?: Tool[];
    tool_choice?: string;
  };
  metadata: {
    timestamp: string;
    messageId: string;
    threadId: string;
    [key: string]: unknown;
  };
}

interface AgentStepOutput {
  rawLLMResponse: LLMCompletion;
  nextMessage: ProcessedMessage;
  actualMessageSentToLLM: ProcessedMessage;
}

interface ResponseOutput {
  completed: boolean;
  nextMessage: ProcessedMessage;
  toolResults: ToolResult[];
  finalMessage?: string;
}
```

---

## When to Move to Level 3

Consider moving to Level 3 (CodeboltAgent) when:
- You don't need custom loop logic
- Standard processor configuration is sufficient
- You want simpler code with less boilerplate
- You're building a standard conversational agent
