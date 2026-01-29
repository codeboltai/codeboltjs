# Migration Guide: Old Processor Pattern to New Processor-Pieces

This document describes how to migrate from the old processor pattern (`bkp/agent/src/processor/`) to the new processor-pieces library (`packages/agent/src/processor-pieces/`) and unified agent (`packages/agent/src/unified/`).

## Feature Comparison: Old Processor vs New Processor-Pieces

### Base Classes

| Old Processor Feature | New Processor-Pieces Equivalent | Status |
|----------------------|--------------------------------|--------|
| `BaseProcessor` (abstract) | Split into specialized processors | ✅ Improved |
| `BaseProcessor.processInput()` | Various `modify()` methods per type | ✅ Available |
| `BaseProcessor.setContext()` | `setContext()` on base classes | ✅ Available |
| `BaseProcessor.getContext()` | `getContext()` on base classes | ✅ Available |
| `BaseProcessor.clearContext()` | `clearContext()` on base classes | ✅ Available |
| `BaseProcessor.createEvent()` | N/A (events handled differently) | ⚠️ Changed |
| `BaseProcessor.createEvents()` | N/A (events handled differently) | ⚠️ Changed |
| `BaseMessageModifier` (abstract) | `BaseMessageModifier` | ✅ Available |
| `BaseMessageModifier.modify(input)` | `modify(originalRequest, createdMessage)` | ✅ Available (signature changed) |
| `RequestMessage` (modifier chain) | `InitialPromptGenerator` | ✅ Available |
| `BaseTool` (abstract) | Moved to `@codebolt/types` | ✅ Available |
| `ToolList` (registry) | Handled by `ToolInjectionModifier` | ✅ Available |
| `AgentStep` (abstract) | `AgentStep` in unified | ✅ Available |
| `LLMAgentStep` (concrete) | `AgentStep` with `llmRole` config | ✅ Available |
| `ToolExecutor` (with retry) | `ResponseExecutor` | ✅ Available |

### Processor Types

| Old Processor Feature | New Processor-Pieces Equivalent | Status |
|----------------------|--------------------------------|--------|
| `Processor` interface | Split into 4 specialized types | ✅ Improved |
| Input processors | `PreInferenceProcessor` | ✅ Available |
| Output processors | `PostInferenceProcessor` | ✅ Available |
| N/A | `PreToolCallProcessor` | ✅ New |
| N/A | `PostToolCallProcessor` | ✅ New |

### Message Modifiers

| Old Processor Feature | New Processor-Pieces Equivalent | Status |
|----------------------|--------------------------------|--------|
| Generic `MessageModifier` | 10 specialized modifiers | ✅ Improved |
| N/A | `ChatHistoryMessageModifier` | ✅ New |
| N/A | `EnvironmentContextModifier` | ✅ New |
| N/A | `DirectoryContextModifier` | ✅ New |
| N/A | `IdeContextModifier` | ✅ New |
| N/A | `CoreSystemPromptModifier` | ✅ New |
| N/A | `ToolInjectionModifier` | ✅ New |
| N/A | `AtFileProcessorModifier` | ✅ New |
| N/A | `MemoryImportModifier` | ✅ New |
| N/A | `ArgumentProcessorModifier` | ✅ New |
| N/A | `ChatRecordingModifier` | ✅ New |

### Pre/Post Inference Processors

| Old Processor Feature | New Processor-Pieces Equivalent | Status |
|----------------------|--------------------------------|--------|
| N/A | `ChatCompressionModifier` | ✅ New |
| N/A | `LoopDetectionModifier` | ✅ New |

### Pre/Post Tool Call Processors

| Old Processor Feature | New Processor-Pieces Equivalent | Status |
|----------------------|--------------------------------|--------|
| N/A | `ToolParameterModifier` | ✅ New |
| N/A | `ToolValidationModifier` | ✅ New |
| N/A | `ShellProcessorModifier` | ✅ New |
| N/A | `ConversationCompactorModifier` | ✅ New |

### Agent & Tool Execution

| Old Processor Feature | New Processor-Pieces Equivalent | Status |
|----------------------|--------------------------------|--------|
| `AgentStep.step()` | `AgentStep.executeStep()` | ✅ Available |
| `AgentStep.generateOneStep()` | `AgentStep.executeStep()` | ✅ Available |
| `AgentStep.loop()` | `CodeboltAgent.processMessage()` | ✅ Available |
| `AgentStep.inputProcessors` | `AgentStep.preInferenceProcessors` | ✅ Renamed |
| `AgentStep.outputProcessors` | `AgentStep.postInferenceProcessors` | ✅ Renamed |
| `ToolExecutor.executeTools()` | `ResponseExecutor.executeTools()` | ✅ Available |
| `ToolExecutor.maxRetries` | Handled in `ResponseExecutor` | ✅ Available |
| `ToolExecutor.retryDelay` | Handled in `ResponseExecutor` | ✅ Available |

### Event Types

| Old Processor Feature | New Processor-Pieces Equivalent | Status |
|----------------------|--------------------------------|--------|
| `AgentEventType.content` | Handled in unified agent | ✅ Available |
| `AgentEventType.tool_call_request` | Handled in unified agent | ✅ Available |
| `AgentEventType.tool_call_response` | Handled in unified agent | ✅ Available |
| `AgentEventType.error` | Handled in unified agent | ✅ Available |
| `AgentEventType.finished` | `ResponseOutput.completed` | ✅ Available |
| `AgentEventType.loop_detected` | `LoopDetectionModifier` | ✅ Available |
| `AgentEventType.chat_compressed` | `ChatCompressionModifier` | ✅ Available |
| `AgentEventType.thought` | N/A | ❌ Missing |
| `AgentEventType.max_session_turns` | Handled in agent loop | ✅ Available |

---

## New Features in Processor-Pieces (Not in Old Processor)

| Feature | Description |
|---------|-------------|
| `BasePreInferenceProcessor` | Dedicated base class for pre-LLM processing |
| `BasePostInferenceProcessor` | Dedicated base class for post-LLM processing |
| `BasePreToolCallProcessor` | Dedicated base class for pre-tool-call processing with interception |
| `BasePostToolCallProcessor` | Dedicated base class for post-tool-call processing |
| `ChatHistoryMessageModifier` | Load previous thread history |
| `EnvironmentContextModifier` | Add OS, date, directory, file context |
| `DirectoryContextModifier` | Generate directory tree view |
| `IdeContextModifier` | Include IDE state (active file, cursor, selection) |
| `CoreSystemPromptModifier` | Set system prompt with user memory |
| `ToolInjectionModifier` | Inject tools from MCP servers |
| `AtFileProcessorModifier` | Process @file references in messages |
| `MemoryImportModifier` | Import @file memory references |
| `ArgumentProcessorModifier` | Process command-line arguments |
| `ChatRecordingModifier` | Record conversations to disk |
| `ChatCompressionModifier` | Compress long chat histories |
| `LoopDetectionModifier` | Detect and prevent conversation loops |
| `ToolParameterModifier` | Transform tool parameters |
| `ToolValidationModifier` | Validate tool parameters |
| `ShellProcessorModifier` | Process shell command injections |
| `ConversationCompactorModifier` | Compact conversation when too long |
| Tool interception via `interceptTool()` | Pre-tool call interception capability |
| Tool validation via `validateToolCall()` | Pre-tool call validation capability |

---

## Missing Features in New Library

### 1. `createEvent()` / `createEvents()` Helper Methods ❌

The old `BaseProcessor` had helper methods to create `ProcessorOutput` events. The new library handles events differently through the unified agent.

**Workaround:** Return events through the `ProcessedMessage` metadata or use unified agent event handlers.

### 2. `AgentEventType.thought` ❌

The old library had a `thought` event type for agent reasoning. This is not explicitly implemented in the new library.

**Workaround:** Add thoughts to the system message or use a custom post-inference processor.

---

## Migration Examples

### Old Processor Pattern

```typescript
import {
    BaseProcessor,
    BaseMessageModifier,
    AgentStep,
    LLMAgentStep,
    ToolExecutor,
    ToolList,
    BaseTool,
    RequestMessage
} from 'bkp/agent/src/processor';

// Custom message modifier
class MyMessageModifier extends BaseMessageModifier {
    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        const { originalRequest, createdMessage } = input;

        // Add custom content to messages
        createdMessage.messages.push({
            role: 'system',
            content: 'Custom instruction'
        });

        return createdMessage;
    }
}

// Custom processor
class MyProcessor extends BaseProcessor {
    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        // Process and return events
        return this.createEvents(
            { type: 'content', value: 'processed' }
        );
    }
}

// Custom tool
class MyTool extends BaseTool {
    constructor() {
        super('my_tool', 'My tool description', { param: { type: 'string' } });
    }

    async execute(params: any): Promise<any> {
        return { result: 'done' };
    }
}

// Using the old pattern
async function runOldAgent(userMessage: any) {
    // Setup tools
    const toolList = new ToolList([new MyTool()]);
    const toolExecutor = new ToolExecutor(toolList);

    // Setup message modifier chain
    const requestMessage = new RequestMessage({
        messageModifiers: [new MyMessageModifier()]
    });

    // Create agent step
    const agentStep = new LLMAgentStep({
        inputProcessors: [new MyProcessor()],
        outputProcessors: [],
        toolList,
        toolExecutor,
        maxIterations: 10
    });

    // Process message
    const processedMessage = await requestMessage.modify(userMessage);

    // Run agent loop
    const result = await agentStep.loop({
        message: processedMessage,
        tools: toolList.getAllTools()
    });

    return result;
}
```

### New Processor-Pieces (Manual Orchestration)

```typescript
import {
    InitialPromptGenerator,
    AgentStep,
    ResponseExecutor
} from '@codebolt/agent/unified';
import {
    BaseMessageModifier,
    BasePreInferenceProcessor,
    BasePostInferenceProcessor,
    BasePreToolCallProcessor,
    ChatHistoryMessageModifier,
    EnvironmentContextModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    CoreSystemPromptModifier,
    ToolInjectionModifier,
    AtFileProcessorModifier,
    ChatCompressionModifier,
    LoopDetectionModifier,
    ToolValidationModifier,
    ShellProcessorModifier
} from '@codebolt/agent/processor-pieces';
import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';

// Custom message modifier (new signature)
class MyMessageModifier extends BaseMessageModifier {
    async modify(
        originalRequest: FlatUserMessage,
        createdMessage: ProcessedMessage
    ): Promise<ProcessedMessage> {
        // Add custom content to messages
        createdMessage.message.messages.push({
            role: 'system',
            content: 'Custom instruction'
        });

        return createdMessage;
    }
}

// Custom pre-inference processor
class MyPreInferenceProcessor extends BasePreInferenceProcessor {
    async modify(
        originalRequest: FlatUserMessage,
        createdMessage: ProcessedMessage
    ): Promise<ProcessedMessage> {
        // Process before LLM call
        return createdMessage;
    }
}

// Custom post-inference processor
class MyPostInferenceProcessor extends BasePostInferenceProcessor {
    async modify(
        llmMessageSent: ProcessedMessage,
        llmResponseMessage: any,
        nextPrompt: ProcessedMessage
    ): Promise<ProcessedMessage> {
        // Process after LLM response
        return nextPrompt;
    }
}

// Custom pre-tool-call processor
class MyPreToolCallProcessor extends BasePreToolCallProcessor {
    async modify(input: any): Promise<any> {
        // Validate or modify tool calls before execution
        return { nextPrompt: input.nextPrompt, shouldExit: false };
    }

    // Optional: Intercept specific tools
    async interceptTool(toolName: string, toolInput: unknown): Promise<boolean> {
        if (toolName === 'dangerous_tool') {
            return true; // Intercept and skip execution
        }
        return false;
    }
}

// Using the new pattern
async function runNewAgent(userMessage: FlatUserMessage) {

    // Step 1: Build initial prompt with all modifiers
    const promptGenerator = new InitialPromptGenerator({
        processors: [
            new ChatHistoryMessageModifier({ enableChatHistory: true }),
            new EnvironmentContextModifier({ enableFullContext: false }),
            new DirectoryContextModifier({}),
            new IdeContextModifier({
                includeActiveFile: true,
                includeOpenFiles: true,
                includeCursorPosition: true
            }),
            new CoreSystemPromptModifier({
                customSystemPrompt: 'Your system prompt here'
            }),
            new ToolInjectionModifier({
                toolsLocation: 'Tool',
                giveToolExamples: true
            }),
            new AtFileProcessorModifier({}),
            new MyMessageModifier({})  // Custom modifier
        ],
        enableLogging: true
    });

    let processedMessage: ProcessedMessage = await promptGenerator.processMessage(userMessage);

    // Step 2: Create AgentStep for LLM inference
    const agentStep = new AgentStep({
        preInferenceProcessors: [
            new ChatCompressionModifier({ enableCompression: true }),
            new MyPreInferenceProcessor()
        ],
        postInferenceProcessors: [
            new LoopDetectionModifier({ enableLoopPrevention: true }),
            new MyPostInferenceProcessor()
        ],
        llmRole: 'default'
    });

    // Step 3: Create ResponseExecutor for tool execution
    const responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [
            new ToolValidationModifier({ strictMode: false }),
            new MyPreToolCallProcessor()
        ],
        postToolCallProcessors: [
            new ShellProcessorModifier({ enableShellExecution: false })
        ]
    });

    // Step 4: Main conversation loop
    let completed = false;

    while (!completed) {
        // LLM Inference
        const stepOutput = await agentStep.executeStep(userMessage, processedMessage);

        // Tool Execution
        const responseOutput = await responseExecutor.executeResponse({
            initialUserMessage: userMessage,
            actualMessageSentToLLM: stepOutput.actualMessageSentToLLM,
            rawLLMOutput: stepOutput.rawLLMResponse,
            nextMessage: stepOutput.nextMessage
        });

        // Check completion
        completed = responseOutput.completed;

        // Update for next iteration
        processedMessage = responseOutput.nextMessage;

        if (completed && responseOutput.finalMessage) {
            return responseOutput.finalMessage;
        }
    }
}
```

### New Processor-Pieces (Simple - Using CodeboltAgent)

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
    ChatHistoryMessageModifier,
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    ToolInjectionModifier,
    ChatCompressionModifier,
    LoopDetectionModifier
} from '@codebolt/agent/processor-pieces';

async function runSimpleAgent(userMessage: FlatUserMessage) {
    // CodeboltAgent provides sensible defaults, but you can customize
    const agent = new CodeboltAgent({
        instructions: 'You are a helpful coding assistant...',

        // Optional: Override default processors
        processors: {
            messageModifiers: [
                new ChatHistoryMessageModifier({ enableChatHistory: true }),
                new EnvironmentContextModifier({ enableFullContext: false }),
                new CoreSystemPromptModifier({
                    customSystemPrompt: 'Your system prompt here'
                }),
                new ToolInjectionModifier({
                    toolsLocation: 'Tool',
                    giveToolExamples: true
                })
            ],
            preInferenceProcessors: [
                new ChatCompressionModifier({ enableCompression: true })
            ],
            postInferenceProcessors: [
                new LoopDetectionModifier({ enableLoopPrevention: true })
            ],
            preToolCallProcessors: [],
            postToolCallProcessors: []
        },
        enableLogging: true
    });

    const result = await agent.processMessage(userMessage);

    if (result.success) {
        return result.result;
    } else {
        throw new Error(result.error);
    }
}
```

---

## Key Architectural Differences

| Aspect | Old Processor Pattern | New Processor-Pieces |
|--------|----------------------|---------------------|
| **Processor Types** | Single `BaseProcessor` | 5 specialized base classes |
| **Method Signature** | `modify(input: { originalRequest, createdMessage })` | `modify(originalRequest, createdMessage)` |
| **Modifier Chain** | `RequestMessage` class | `InitialPromptGenerator` class |
| **Processor Naming** | `inputProcessors` / `outputProcessors` | `preInferenceProcessors` / `postInferenceProcessors` |
| **Tool Execution** | Separate `ToolExecutor` class | Integrated into `ResponseExecutor` |
| **Tool List** | Separate `ToolList` class | `ToolInjectionModifier` handles this |
| **Tool Base Class** | `BaseTool` in processor | Moved to `@codebolt/types` |
| **Event Handling** | `ProcessorOutput` with type/value | Events through unified agent |
| **Loop Management** | `AgentStep.loop()` | `CodeboltAgent.processMessage()` |
| **Pre-Tool Processing** | N/A | `BasePreToolCallProcessor` with interception |
| **Post-Tool Processing** | N/A | `BasePostToolCallProcessor` |
| **Context Modifiers** | Manual implementation | 10 built-in modifiers |
| **Chat Compression** | Manual implementation | `ChatCompressionModifier` |
| **Loop Detection** | Manual implementation | `LoopDetectionModifier` |

---

## Processor Type Mapping

```
Old Pattern                          New Processor-Pieces
─────────────────────────────────────────────────────────────────
BaseProcessor                   →    (Split into specialized types)
  ├─ inputProcessors           →    BasePreInferenceProcessor
  └─ outputProcessors          →    BasePostInferenceProcessor

BaseMessageModifier            →    BaseMessageModifier
                                    (signature changed)

N/A                            →    BasePreToolCallProcessor
                                    (new: tool interception/validation)

N/A                            →    BasePostToolCallProcessor
                                    (new: tool result processing)
```

---

## Processing Pipeline Comparison

### Old Pattern Pipeline

```
User Message
    ↓
RequestMessage.modify()
    ├─ MessageModifier[0].modify(input)
    ├─ MessageModifier[1].modify(input)
    └─ ...
    ↓
AgentStep.step()
    ├─ inputProcessors[].processInput()
    ├─ LLM Call
    └─ outputProcessors[].processInput()
    ↓
ToolExecutor.executeTools()
    └─ Tool[].execute()
    ↓
Loop until finished
```

### New Pattern Pipeline

```
User Message (FlatUserMessage)
    ↓
InitialPromptGenerator.processMessage()
    ├─ MessageModifier[0].modify(originalRequest, createdMessage)
    ├─ MessageModifier[1].modify(originalRequest, createdMessage)
    └─ ... (10 built-in modifiers available)
    ↓
AgentStep.executeStep()
    ├─ PreInferenceProcessor[].modify()     ← NEW: ChatCompression, etc.
    ├─ LLM Call
    └─ PostInferenceProcessor[].modify()    ← NEW: LoopDetection, etc.
    ↓
ResponseExecutor.executeResponse()
    ├─ PreToolCallProcessor[].modify()      ← NEW: Validation, Interception
    ├─ executeTool() for each tool call
    └─ PostToolCallProcessor[].modify()     ← NEW: Shell processing, Compaction
    ↓
Loop until completed
```

---

## Summary

**All core functionality is available** in the new processor-pieces library with significant improvements:

1. **5 specialized processor base classes** instead of a single generic one
2. **10 built-in message modifiers** for common use cases
3. **Pre/Post tool-call processing** with interception and validation capabilities
4. **Built-in chat compression** and **loop detection**
5. **Cleaner method signatures** with separated parameters
6. **Better separation of concerns** between processing stages

The only minor change is:
- **Event handling** is now integrated into the unified agent rather than through `ProcessorOutput` objects

The new library provides **significantly more functionality** out of the box while maintaining the same extensible architecture through abstract base classes.
