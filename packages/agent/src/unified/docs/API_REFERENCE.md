# CodeBolt Agent API Reference

This document provides detailed API reference for all classes, interfaces, and functions in the `@codebolt/agent` package.

## Table of Contents

1. [Composable Pattern API](#composable-pattern-api)
2. [Builder Pattern API](#builder-pattern-api)
3. [Processor Pattern API](#processor-pattern-api)
4. [Memory System API](#memory-system-api)
5. [Workflow System API](#workflow-system-api)
6. [Tool System API](#tool-system-api)
7. [Type Definitions](#type-definitions)
8. [Error Handling](#error-handling)

## Composable Pattern API

### ComposableAgent

#### Constructor

```typescript
new ComposableAgent(config: ComposableAgentConfig)
```

**Parameters:**
- `config` - Agent configuration object

#### Methods

##### execute()

Execute a single message with the agent.

```typescript
execute(
  message: string, 
  options?: {
    stream?: boolean;
    callback?: StreamCallback;
  }
): Promise<ExecutionResult>
```

**Parameters:**
- `message` - User message string
- `options.stream` - Enable streaming responses (default: false)
- `options.callback` - Callback for streaming chunks

**Returns:** `Promise<ExecutionResult>`

**Example:**
```typescript
const result = await agent.execute('Hello, how can you help me?');
console.log(result.message);

// With streaming
await agent.execute('Explain AI', {
  stream: true,
  callback: (chunk) => console.log(chunk.content)
});
```

##### executeMessage()

Execute with CodeBolt message format (includes file mentions, MCP tools, etc.).

```typescript
executeMessage(
  message: CodeBoltMessage,
  options?: {
    stream?: boolean;
    callback?: StreamCallback;
  }
): Promise<ExecutionResult>
```

**Parameters:**
- `message` - CodeBolt formatted message object
- `options` - Execution options

**Example:**
```typescript
const result = await agent.executeMessage({
  userMessage: 'Analyze this file',
  mentionedFiles: ['./src/main.ts'],
  mentionedMCPs: [{ toolbox: 'git', toolName: 'status' }],
  mentionedAgents: [],
  remixPrompt: 'Focus on performance issues'
});
```

##### run()

Start an interactive session (useful for chat-based interfaces).

```typescript
run(options?: {
  stream?: boolean;
  callback?: StreamCallback;
}): Promise<ExecutionResult>
```

##### addMessage()

Add a message to the conversation history.

```typescript
addMessage(message: Message): void
```

##### getConversation()

Get the current conversation history.

```typescript
getConversation(): Message[]
```

##### clearConversation()

Clear the conversation history.

```typescript
clearConversation(): void
```

##### saveConversation()

Save conversation to memory.

```typescript
saveConversation(): Promise<void>
```

##### loadConversation()

Load conversation from memory.

```typescript
loadConversation(): Promise<void>
```

#### Configuration Interface

```typescript
interface ComposableAgentConfig {
  name: string;                          // Agent display name
  instructions: string;                  // System instructions/prompt
  model: string;                        // Model name (references codeboltagents.yaml)
  tools?: Record<string, Tool>;         // Available tools
  memory?: Memory;                      // Memory storage instance
  maxTurns?: number;                    // Max conversation turns (default: 50)
  processing?: AgentProcessingConfig;   // Processing options
  metadata?: Record<string, any>;       // Custom metadata
}
```

## Builder Pattern API

### Agent

Core agent class for the builder pattern.

#### Constructor

```typescript
new Agent(tools: Tool[], systemPrompt: SystemPrompt)
```

#### Methods

##### runAgent()

Execute agent with task instruction.

```typescript
runAgent(taskInstruction: TaskInstruction): Promise<any>
```

### InitialPromptBuilder

Fluent builder for constructing initial prompts.

#### Constructor

```typescript
new InitialPromptBuilder(userMessage: string)
```

#### Methods

##### addSystemInstructions()

```typescript
addSystemInstructions(instructions: string): InitialPromptBuilder
```

##### addFile()

```typescript
addFile(filePath: string): InitialPromptBuilder
```

##### addTaskDetails()

```typescript
addTaskDetails(details: string): InitialPromptBuilder
```

##### build()

```typescript
build(): Promise<any>
```

### LLMOutputHandler

Handles LLM responses and tool execution.

#### Constructor

```typescript
new LLMOutputHandler(llmOutput: any, codebolt: CodeboltAPI)
```

#### Methods

##### processLLMResponse()

```typescript
processLLMResponse(response: any, tools: Tool[]): Promise<any>
```

##### sendMessageToUser()

```typescript
sendMessageToUser(): Promise<void>
```

##### runTools()

```typescript
runTools(): Promise<any>
```

##### isCompleted()

```typescript
isCompleted(): boolean
```

### SystemPrompt

Manages system prompts from YAML files.

#### Methods

##### loadPrompt()

```typescript
loadPrompt(filePath: string): Promise<void>
```

### TaskInstruction

Handles task instructions and metadata.

#### Methods

##### loadInstruction()

```typescript
loadInstruction(filePath: string): Promise<void>
```

### UserMessage

Builder for user messages with file content support.

#### Methods

##### addMessage()

```typescript
addMessage(message: string): Promise<void>
```

##### addFileContent()

```typescript
addFileContent(filePath: string): Promise<void>
```

## Processor Pattern API

### BaseProcessor

Abstract base class for custom processors.

#### Constructor

```typescript
new BaseProcessor()
```

#### Methods

##### process()

```typescript
abstract process(messages: any[]): Promise<any>
```

### AgentStep

Represents a single step in agent execution.

#### Constructor

```typescript
new AgentStep(options: AgentStepOptions)
```

#### Methods

##### execute()

```typescript
execute(context: any): Promise<any>
```

### BaseTool

Abstract base class for custom tools.

#### Constructor

```typescript
new BaseTool(config: ToolConfig)
```

#### Methods

##### execute()

```typescript
abstract execute(params: any): Promise<any>
```

## Memory System API

### Memory

Core memory management class.

#### Constructor

```typescript
new Memory(config: MemoryConfig)
```

#### Methods

##### save()

```typescript
save(): Promise<void>
```

##### load()

```typescript
load(): Promise<Message[]>
```

##### clear()

```typescript
clear(): Promise<void>
```

##### setConversationKey()

```typescript
setConversationKey(key: string): void
```

##### listConversations()

```typescript
listConversations(): Promise<string[]>
```

### Storage Providers

#### createCodeBoltAgentMemory()

Create agent-scoped persistent memory.

```typescript
createCodeBoltAgentMemory(agentId: string): Memory
```

#### createCodeBoltProjectMemory()

Create project-scoped persistent memory.

```typescript
createCodeBoltProjectMemory(projectId: string): Memory
```

#### createCodeBoltDbMemory()

Create fast-access memory database storage.

```typescript
createCodeBoltDbMemory(key: string): Memory
```

#### LibSQLStore

SQLite/LibSQL storage provider.

```typescript
new LibSQLStore(config: LibSQLStoreConfig)
```

**Configuration:**
```typescript
interface LibSQLStoreConfig {
  url: string;          // Database URL
  authToken?: string;   // Auth token for remote databases
  tableName?: string;   // Custom table name
}
```

## Workflow System API

### createWorkflow()

Create a new workflow instance.

```typescript
createWorkflow(config: WorkflowConfig): Workflow
```

**Configuration:**
```typescript
interface WorkflowConfig {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  initialData?: Record<string, any>;
  timeout?: number;
  continueOnError?: boolean;
  maxParallelSteps?: number;
}
```

### Workflow

#### Methods

##### execute()

Execute the workflow.

```typescript
execute(initialData?: Record<string, any>): Promise<WorkflowResult>
```

### Step Creation Functions

#### createAgentStep()

Create an agent execution step.

```typescript
createAgentStep(config: AgentStepConfig): WorkflowStep
```

**Configuration:**
```typescript
interface AgentStepConfig {
  id: string;
  name: string;
  agent: ComposableAgent;
  messageTemplate: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  condition?: (context: WorkflowContext) => boolean;
  parallel?: boolean;
  retry?: RetryConfig;
}
```

#### createTransformStep()

Create a data transformation step.

```typescript
createTransformStep(config: TransformStepConfig): WorkflowStep
```

#### createConditionalStep()

Create a conditional execution step.

```typescript
createConditionalStep(config: ConditionalStepConfig): WorkflowStep
```

#### createDelayStep()

Create a delay step.

```typescript
createDelayStep(delay: number): WorkflowStep
```

#### createStep()

Create a custom step.

```typescript
createStep(config: StepConfig): WorkflowStep
```

#### createSimpleStep()

Create a simple synchronous transformation step.

```typescript
createSimpleStep(config: SimpleStepConfig): WorkflowStep
```

#### createAsyncStep()

Create an asynchronous step.

```typescript
createAsyncStep(config: AsyncStepConfig): WorkflowStep
```

#### createValidationStep()

Create a data validation step.

```typescript
createValidationStep(config: ValidationStepConfig): WorkflowStep
```

#### createLoggingStep()

Create a logging step.

```typescript
createLoggingStep(config: LoggingStepConfig): WorkflowStep
```

## Tool System API

### createTool()

Create a new tool with validation.

```typescript
createTool<TInput, TOutput>(config: ToolConfig<TInput, TOutput>): Tool<TInput, TOutput>
```

**Configuration:**
```typescript
interface ToolConfig<TInput, TOutput> {
  id: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  execute: (params: { 
    context: TInput; 
    agent?: ComposableAgent 
  }) => Promise<TOutput>;
}
```

**Example:**
```typescript
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string(),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
    humidity: z.number()
  }),
  execute: async ({ context }) => {
    const data = await weatherAPI.get(context.location, context.units);
    return {
      temperature: data.temp,
      conditions: data.conditions,
      humidity: data.humidity
    };
  }
});
```

### Built-in Tools

#### attemptCompletionTool

Mark a task as completed.

```typescript
const completionTool = attemptCompletionTool;
```

#### askFollowUpTool

Ask the user for more information.

```typescript
const followUpTool = askFollowUpTool;
```

### Tool Utilities

#### toolToOpenAIFunction()

Convert a tool to OpenAI function format.

```typescript
toolToOpenAIFunction(tool: Tool): OpenAIFunction
```

#### toolsToOpenAIFunctions()

Convert multiple tools to OpenAI functions.

```typescript
toolsToOpenAIFunctions(tools: Record<string, Tool>): OpenAIFunction[]
```

#### executeTool()

Execute a tool with validation.

```typescript
executeTool(tool: Tool, input: any, agent?: ComposableAgent): Promise<any>
```

## Type Definitions

### Core Types

#### Message

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | MessageContent[];
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}
```

#### MessageContent

```typescript
interface MessageContent {
  type: 'text' | 'image' | 'file';
  text?: string;
  image_url?: string;
  file?: string;
}
```

#### ToolCall

```typescript
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}
```

#### ExecutionResult

```typescript
interface ExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
  conversation: Message[];
  metadata?: Record<string, any>;
}
```

#### StreamChunk

```typescript
interface StreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'error';
  content: string;
  tool_call?: ToolCall;
  metadata?: Record<string, any>;
}
```

#### StreamCallback

```typescript
type StreamCallback = (chunk: StreamChunk) => void | Promise<void>;
```

### Workflow Types

#### WorkflowContext

```typescript
interface WorkflowContext {
  data: Record<string, any>;
  history: WorkflowStepResult[];
  currentStep: number;
  metadata: Record<string, any>;
}
```

#### WorkflowStepResult

```typescript
interface WorkflowStepResult {
  stepId: string;
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}
```

#### WorkflowResult

```typescript
interface WorkflowResult {
  success: boolean;
  data: Record<string, any>;
  stepResults: WorkflowStepResult[];
  executionTime: number;
  error?: string;
  metadata: Record<string, any>;
}
```

### Storage Types

#### StorageProvider

```typescript
interface StorageProvider {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
}
```

#### MemoryConfig

```typescript
interface MemoryConfig {
  storage: StorageProvider;
  maxMessages?: number;
  autoSave?: boolean;
}
```

### Document Types

#### DocumentConfig

```typescript
interface DocumentConfig {
  content: string;
  type?: 'text' | 'markdown' | 'json' | 'xml';
  metadata?: Record<string, any>;
}
```

#### ProcessedDocument

```typescript
interface ProcessedDocument {
  content: string;
  chunks?: string[];
  metadata: Record<string, any>;
  embeddings?: number[][];
}
```

## Error Handling

### Common Error Types

#### ValidationError

Thrown when tool input/output validation fails.

```typescript
try {
  await tool.execute(invalidInput);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.issues);
  }
}
```

#### ExecutionError

Thrown when tool execution fails.

```typescript
try {
  await agent.execute(message);
} catch (error) {
  if (error instanceof ExecutionError) {
    console.log('Execution failed:', error.message);
    console.log('Context:', error.context);
  }
}
```

#### MemoryError

Thrown when memory operations fail.

```typescript
try {
  await memory.save();
} catch (error) {
  if (error instanceof MemoryError) {
    console.log('Memory operation failed:', error.message);
  }
}
```

### Error Handling Best Practices

1. **Always handle execution errors:**
```typescript
const result = await agent.execute(message);
if (!result.success) {
  console.error('Agent execution failed:', result.error);
  // Handle error appropriately
}
```

2. **Use try-catch for tool execution:**
```typescript
try {
  const toolResult = await executeTool(tool, input);
  // Handle success
} catch (error) {
  // Handle tool execution failure
  console.error('Tool execution failed:', error);
}
```

3. **Validate inputs before tool execution:**
```typescript
const tool = createTool({
  inputSchema: z.object({
    value: z.number().min(0).max(100)
  }),
  execute: async ({ context }) => {
    // Input is guaranteed to be valid here
    return { result: context.value * 2 };
  }
});
```

4. **Implement retry logic for unreliable operations:**
```typescript
const apiTool = createTool({
  execute: async ({ context }) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await callExternalAPI(context.url);
      } catch (error) {
        if (attempt === 3) throw error;
        await delay(1000 * attempt);
      }
    }
  }
});
```

---

For more detailed examples and usage patterns, see the [main documentation](./DOCUMENTATION.md).