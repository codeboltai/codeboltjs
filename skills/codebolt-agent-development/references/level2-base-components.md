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
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage, AgentStepOutput } from '@codebolt/types/agent';

const step: AgentStep = new AgentStep({
  preInferenceProcessors: [],
  postInferenceProcessors: [
    new LoopDetectionModifier({ enableLoopPrevention: true })
  ],
  llmRole: 'default'
});

const result: AgentStepOutput = await step.executeStep(userMessage, processedMessage);

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
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { AgentStepOutput, ResponseExecutorResult } from '@codebolt/types/agent';

const executor: ResponseExecutor = new ResponseExecutor({
  preToolCallProcessors: [],
  postToolCallProcessors: [
    new ShellProcessorModifier({ enableShellExecution: true })
  ]
});

const result: ResponseExecutorResult = await executor.executeResponse({
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

### Built-in Tool Routing

ResponseExecutor automatically routes tools based on naming patterns:

| Tool Name Pattern | Execution Route |
|-------------------|-----------------|
| `toolbox--toolname` | MCP: `codebolt.mcp.executeTool(toolbox, toolname, args)` |
| `subagent--agentname` | Subagent: `codebolt.agent.startAgent(agentname, task)` |
| `codebolt--thread_management` | Thread: `codebolt.thread.createThreadInBackground(options)` |
| `attempt_completion` | Completion: Sets `completed = true` |

---

## Adding Custom/Local Tools

When you need tools that don't go through MCP, use `PreToolCallProcessor` to intercept tool calls and execute custom logic.

### Pattern: Intercept and Handle Custom Tools

```typescript
import { BasePreToolCallProcessor } from '@codebolt/agent/processor-pieces';
import type { PreToolCallProcessorInput, ProcessedMessage } from '@codebolt/types/agent';

class CustomLocalToolProcessor extends BasePreToolCallProcessor {
  async modify(input: PreToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    const toolCalls = input.rawLLMResponseMessage.choices?.[0]?.message?.tool_calls || [];
    const handledToolIds = new Set<string>();

    for (const toolCall of toolCalls) {
      // Check if this is your custom tool
      if (toolCall.function.name === 'my_local_calculator') {
        const args = JSON.parse(toolCall.function.arguments);

        // Execute your custom logic
        const result = this.calculate(args.expression);

        // Add result to message history
        input.nextPrompt.message.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ result })
        });

        handledToolIds.add(toolCall.id);
      }
    }

    // Remove handled tool calls so ResponseExecutor doesn't try to execute them
    if (handledToolIds.size > 0) {
      const message = input.rawLLMResponseMessage.choices?.[0]?.message;
      if (message?.tool_calls) {
        message.tool_calls = message.tool_calls.filter(tc => !handledToolIds.has(tc.id));
      }
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }

  private calculate(expression: string): number {
    // Your custom logic here
    return eval(expression); // Example only - use proper parser in production
  }
}
```

### Using Custom Tools with ResponseExecutor

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import { ToolInjectionModifier } from '@codebolt/agent/processor-pieces';
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage, AgentStepOutput, ResponseExecutorResult } from '@codebolt/types/agent';

// Define your custom tool schema for the LLM
const customToolSchema = {
  type: 'function',
  function: {
    name: 'my_local_calculator',
    description: 'Calculate a mathematical expression',
    parameters: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Math expression to evaluate' }
      },
      required: ['expression']
    }
  }
};

// Create components
const promptGenerator = new InitialPromptGenerator({
  processors: [
    new ToolInjectionModifier({
      additionalTools: [customToolSchema]  // Inject custom tool into LLM context
    })
  ]
});

const agentStep = new AgentStep({});

const responseExecutor = new ResponseExecutor({
  preToolCallProcessors: [
    new CustomLocalToolProcessor()  // Handle custom tools before MCP execution
  ],
  postToolCallProcessors: []
});

// Agent loop
codebolt.onMessage(async (userMessage: FlatUserMessage): Promise<void> => {
  let prompt: ProcessedMessage = await promptGenerator.processMessage(userMessage);
  let completed: boolean = false;

  while (!completed) {
    const stepResult: AgentStepOutput = await agentStep.executeStep(userMessage, prompt);

    const execResult: ResponseExecutorResult = await responseExecutor.executeResponse({
      initialUserMessage: userMessage,
      actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
      rawLLMOutput: stepResult.rawLLMResponse,
      nextMessage: stepResult.nextMessage
    });

    completed = execResult.completed;
    prompt = execResult.nextMessage;
  }
});
```

### When to Use Custom Tools vs MCP

| Use Case | Approach |
|----------|----------|
| Tool specific to this agent | Custom tool via `PreToolCallProcessor` |
| Tool shared across agents | MCP server via `@codebolt/mcp` |
| Tool needs local resources | Custom tool (access to local variables/state) |
| Tool is a web service | MCP server (standard interface) |

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
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage, AgentStepOutput, ResponseExecutorResult } from '@codebolt/types/agent';

const MAX_ITERATIONS: number = 20;

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

  async execute(userMessage: FlatUserMessage): Promise<string | undefined> {
    let prompt: ProcessedMessage = await this.promptGen.processMessage(userMessage);

    for (let i: number = 0; i < MAX_ITERATIONS; i++) {
      // LLM inference
      const stepResult: AgentStepOutput = await this.agentStep.executeStep(userMessage, prompt);

      // Custom logic point: inspect LLM response
      console.log('Iteration:', i, 'Tool calls:',
        stepResult.rawLLMResponse.choices[0].message.tool_calls?.length ?? 0);

      // Tool execution
      const execResult: ResponseExecutorResult = await this.responseExec.executeResponse({
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
codebolt.onMessage(async (msg: FlatUserMessage): Promise<void> => {
  const agent: Level2Agent = new Level2Agent('You are a coding assistant.');
  const result: string | undefined = await agent.execute(msg);
  if (result) {
    codebolt.chat.sendMessage(result);
  }
});
```

---

## Key Types

Import types from their respective packages:

```typescript
// From @codebolt/types/sdk
import type { FlatUserMessage, LLMCompletion, MessageObject, ToolCall } from '@codebolt/types/sdk';

// From @codebolt/types/agent
import type { ProcessedMessage, AgentStepOutput, ResponseInput, ResponseOutput, ToolResult } from '@codebolt/types/agent';
```

**Type Definitions (for reference):**

```typescript
// ProcessedMessage - Output from InitialPromptGenerator
interface ProcessedMessage {
  message: {
    messages: MessageObject[];
    tools?: Tool[];
    tool_choice?: string;
  };
  metadata?: Record<string, unknown>;
}

// AgentStepOutput - Output from AgentStep.executeStep()
interface AgentStepOutput {
  rawLLMResponse: LLMCompletion;
  nextMessage: ProcessedMessage;
  actualMessageSentToLLM: ProcessedMessage;
}

// ResponseOutput - Output from ResponseExecutor.executeResponse()
interface ResponseOutput {
  completed: boolean;
  nextMessage: ProcessedMessage;
  toolResults?: ToolResult[];
  finalMessage?: string;
}

// ResponseInput - Input for ResponseExecutor.executeResponse()
interface ResponseInput {
  initialUserMessage: FlatUserMessage;
  actualMessageSentToLLM: ProcessedMessage;
  rawLLMOutput: LLMCompletion;
  nextMessage: ProcessedMessage;
}
```

---

## Agent Loop with Async Events

For orchestrators and long-running agents, you can handle async events from child agents within the loop.

### Event Queue API

```typescript
const eventQueue = codebolt.agentEventQueue;
const agentTracker = codebolt.backgroundChildThreads;

// Check for pending events (non-blocking)
const events = await eventQueue.getPendingQueueEvents();

// Wait for next event (blocking - keeps agent alive)
const event = await eventQueue.waitForNextQueueEvent();

// Get pending event count
const count = eventQueue.getPendingExternalEventCount();

// Wait for any external event (queue events, background completions)
const externalEvent = await eventQueue.waitForAnyExternalEvent();
```

### Event Types

```typescript
type ExternalEventType =
  | 'agentQueueEvent'              // Message from child agent
  | 'backgroundAgentCompletion'    // Background agent finished
  | 'backgroundGroupedAgentCompletion'; // Grouped agents finished

interface UnifiedExternalEvent {
  type: ExternalEventType;
  data: any;
}
```

### Orchestrator Pattern (Long-Running)

```typescript
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';

const eventQueue = codebolt.agentEventQueue;
const agentTracker = codebolt.backgroundChildThreads;

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  const promptGenerator = new InitialPromptGenerator({ /* ... */ });
  let prompt = await promptGenerator.processMessage(reqMessage);
  let continueLoop = true;

  do {
    // Run agent loop until no more tool calls
    const result = await runAgentLoop(reqMessage, prompt);
    prompt = result.prompt;

    // Check for async events from child agents
    if (agentTracker.getRunningAgentCount() > 0 ||
        eventQueue.getPendingExternalEventCount() > 0) {

      const events = await eventQueue.getPendingQueueEvents();

      for (const event of events) {
        if (event.type === 'backgroundAgentCompletion') {
          // Handle child agent completion
          prompt.message.messages.push({
            role: 'assistant',
            content: `Background agent completed: ${JSON.stringify(event.data)}`
          });
        } else if (event.type === 'agentQueueEvent') {
          // Handle message from child agent
          prompt.message.messages.push({
            role: 'user',
            content: `<child_agent_message>
              <source_agent>${event.data.sourceAgentId}</source_agent>
              <content>${event.data.payload?.content}</content>
            </child_agent_message>`
          });
        }
      }
      continueLoop = true;
    } else {
      continueLoop = false;
    }

  } while (continueLoop);
});
```

### Persistent Orchestrator (Never Exits)

For orchestrators that should stay alive indefinitely:

```typescript
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  // Initial processing...

  // Keep orchestrator alive, waiting for events
  while (true) {
    const event = await eventQueue.waitForAnyExternalEvent();

    // Process the event
    if (event.type === 'agentQueueEvent') {
      // Handle message from child agent
      await processChildAgentMessage(event.data);
    } else if (event.type === 'backgroundAgentCompletion') {
      // Handle completion
      await processCompletion(event.data);
    }

    // Optional: break condition
    if (shouldTerminate(event)) {
      break;
    }
  }
});
```

### Sending Messages to Other Agents

```typescript
// Send message to another agent's queue
await eventQueue.sendAgentMessage({
  targetAgentId: 'worker-agent-123',
  content: 'Task completed successfully',
  metadata: { taskId: 'task-456' }
});

// Add event to agent's queue
await eventQueue.addEvent({
  targetAgentId: 'worker-agent-123',
  eventType: 'taskAssignment',
  payload: { task: 'Implement feature X' }
});
```

---

## When to Move to Level 3

Consider moving to Level 3 (CodeboltAgent) when:
- You don't need custom loop logic
- Standard processor configuration is sufficient
- You want simpler code with less boilerplate
- You're building a standard conversational agent
