# Migration Guide: Builder Pattern to Unified Library

This document describes how to migrate from the old builder pattern (`bkp/agent/src/builderpattern/`) to the new unified library (`packages/agent/src/unified/`).

## Feature Comparison: Builder Pattern vs Unified Library

### Prompt Building

| Builder Pattern Feature | Unified Library Equivalent | Status |
|------------------------|---------------------------|--------|
| `PromptBuilder.addMCPTools()` | `ToolInjectionModifier` | ✅ Available |
| `PromptBuilder.addAgentTools()` | `ToolInjectionModifier` (via mentionedMCPs) | ✅ Available |
| `PromptBuilder.addEnvironmentDetails()` | `EnvironmentContextModifier` | ✅ Available |
| `PromptBuilder.addSystemPrompt(yaml, key, example)` | `CoreSystemPromptModifier` | ⚠️ Partial - no YAML loading |
| `PromptBuilder.addTaskInstruction(yaml, section)` | N/A | ❌ Missing |
| `PromptBuilder.addAllAutomatic()` | `CodeboltAgent` default modifiers | ✅ Available |
| `PromptBuilder.addMCPToolsToPrompt()` | `ToolInjectionModifier` with `toolsLocation: 'InsidePrompt'` | ✅ Available |
| `PromptBuilder.addAgentsToPrompt()` | N/A | ❌ Missing |
| `PromptBuilder.setTools(tools)` | Direct on `ProcessedMessage.message.tools` | ✅ Available |
| `PromptBuilder.addTools(tools)` | Push to `ProcessedMessage.message.tools` | ✅ Available |
| `PromptBuilder.addToConversationHistory()` | Push to `ProcessedMessage.message.messages` | ✅ Available |
| `PromptBuilder.addUserMessage()` | Push to messages array | ✅ Available |
| `PromptBuilder.addLLMResponse()` | `AgentStep` does this automatically | ✅ Available |
| `PromptBuilder.addToolResults()` | `ResponseExecutor` does this automatically | ✅ Available |
| `PromptBuilder.addDefaultContinuationMessage()` | `ResponseExecutor` adds this automatically | ✅ Available |
| `PromptBuilder.addCustomSection()` | Custom `MessageModifier` | ✅ Extensible |
| `PromptBuilder.addSystemInstruction()` | `CoreSystemPromptModifier` | ✅ Available |
| `PromptBuilder.addContext()` | `addUserContext()` helper | ✅ Available |
| `PromptBuilder.reset()` | Create new `InitialPromptGenerator` | ✅ Available |
| `PromptBuilder.buildInferenceParams()` | `InitialPromptGenerator.processMessage()` | ✅ Available |
| `PromptBuilder.getConversationHistory()` | `ProcessedMessage.message.messages` | ✅ Available |
| `PromptBuilder.getTools()` | `ProcessedMessage.message.tools` | ✅ Available |
| `PromptBuilder.isTaskCompleted()` | `ResponseOutput.completed` | ✅ Available |
| `PromptBuilder.shouldSummarizeConversation()` | `ChatCompressionModifier` | ✅ Available |

### LLM Output Handling

| Builder Pattern Feature | Unified Library Equivalent | Status |
|------------------------|---------------------------|--------|
| `LLMOutputHandler.isCompleted()` | `ResponseOutput.completed` | ✅ Available |
| `LLMOutputHandler.sendMessageToUser()` | `ResponseExecutor.executeTools()` does this | ✅ Automatic |
| `LLMOutputHandler.runTools()` | `ResponseExecutor.executeResponse()` | ✅ Available |
| `LLMOutputHandler.getToolResults()` | `ResponseOutput.toolResults` | ✅ Available |
| `LLMOutputHandler.hasToolCalls()` | Check `rawLLMOutput.choices[0].message.tool_calls` | ✅ Available |
| `LLMOutputHandler.getAssistantMessage()` | `ResponseOutput.finalMessage` | ✅ Available |

### Follow-Up Building

| Builder Pattern Feature | Unified Library Equivalent | Status |
|------------------------|---------------------------|--------|
| `FollowUpQuestionBuilder.addPreviousConversation()` | Automatic in `ResponseOutput.nextMessage` | ✅ Automatic |
| `FollowUpQuestionBuilder.addToolResult()` | Automatic in `ResponseOutput.nextMessage` | ✅ Automatic |
| `FollowUpQuestionBuilder.checkAndSummarizeConversationIfLong()` | `ChatCompressionModifier` | ✅ Available |

### Special Features

| Builder Pattern Feature | Unified Library Equivalent | Status |
|------------------------|---------------------------|--------|
| Sub-agent execution (`subagent--`) | `ResponseExecutor.executeTools()` | ✅ Available |
| Thread management (`codebolt--thread_management`) | `ResponseExecutor.executeTools()` | ✅ Available |
| `attempt_completion` detection | `ResponseExecutor.executeTools()` | ✅ Available |
| User rejection handling | `ResponseExecutor.executeTools()` | ✅ Available |
| Browser payload handling | `ResponseExecutor.parseToolResult()` | ✅ Available |

### New Features in Unified (Not in Builder Pattern)

| Feature | Description |
|---------|-------------|
| `AtFileProcessorModifier` | Process @file references in messages |
| `DirectoryContextModifier` | Generate directory tree view |
| `IdeContextModifier` | Include IDE state (active file, cursor, selection) |
| `ChatHistoryMessageModifier` | Load previous thread history |
| `LoopDetectionModifier` | Detect and prevent conversation loops |
| `MemoryImportModifier` | Import @file memory references |
| `ChatRecordingModifier` | Record conversations to disk |
| `ShellProcessorModifier` | Process shell command injections |
| `ToolValidationModifier` | Validate tool parameters |
| `Tool` class | Zod-based input/output validation |

---

## Missing Features in Unified

### 1. YAML-based System Prompt Loading ❌

The old `addSystemPrompt('agent.yaml', 'test', 'example.md')` loaded prompts from YAML files with key lookup. The unified library's `CoreSystemPromptModifier` only accepts raw strings.

**Workaround:** Load YAML yourself and pass the string:

```typescript
import yaml from 'yaml';
import fs from 'fs';

const config = yaml.parse(fs.readFileSync('agent.yaml', 'utf8'));
const systemPrompt = config.test; // or whatever key structure you have

new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt });
```

### 2. YAML-based Task Instruction Loading ❌

The old `addTaskInstruction('task.yaml', 'main_task')` is completely missing.

**Workaround:** Load YAML and append to system prompt or user message manually.

### 3. Agent Tools to Prompt ❌

The old `addAgentsToPrompt()` which converted agent definitions to prompt text is missing.

**Workaround:** Create a custom `MessageModifier` to add agent descriptions to the prompt.

---

## Migration Examples

### Old Builder Pattern

```typescript
import { PromptBuilder, LLMOutputHandler, FollowUpQuestionBuilder } from './promptbuilder';
import llm from '../modules/llm';

async function runAgentWorkflow(userMessage: any, codebolt: CodeboltAPI) {
    // Step 1: Build initial prompt
    const promptBuilder = new PromptBuilder(userMessage, codebolt);
    let userPrompt = await promptBuilder
        .addMCPTools()
        .addAgentTools()
        .addEnvironmentDetails()
        .addSystemPrompt('agent.yaml', 'test', 'example.md')
        .addTaskInstruction('task.yaml', 'main_task')
        .buildInferenceParams();

    // Step 2: Main conversation loop
    let llmOutput = llm.inference(userPrompt);
    let llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);

    while (!llmOutputObject.isCompleted()) {
        // Send message to user
        await llmOutputObject.sendMessageToUser();

        // Execute tools
        const toolCallResult = await llmOutputObject.runTools();

        // Build follow-up prompt
        const followUpBuilder = new FollowUpQuestionBuilder(codebolt);
        const nextUserPrompt = await followUpBuilder
            .addPreviousConversation(userPrompt)
            .addToolResult(toolCallResult)
            .checkAndSummarizeConversationIfLong()
            .buildInferenceParams();

        // Get next response
        llmOutput = llm.inference(nextUserPrompt);
        llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);

        // Update for next iteration
        userPrompt = nextUserPrompt;
    }

    console.log("Agent workflow completed successfully!");
}
```

### New Unified Library (Manual Orchestration)

```typescript
import {
    InitialPromptGenerator,
    AgentStep,
    ResponseExecutor
} from '@codebolt/agent/unified';
import {
    ToolInjectionModifier,
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    ChatHistoryMessageModifier,
    DirectoryContextModifier,
    AtFileProcessorModifier,
    ChatCompressionModifier
} from '@codebolt/agent/processor-pieces';
import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';

async function runAgentWorkflow(userMessage: FlatUserMessage, codebolt: CodeboltAPI) {

    // Step 1: Build initial prompt with all modifiers
    // This replaces: PromptBuilder with addMCPTools, addAgentTools, addEnvironmentDetails, addSystemPrompt
    const promptGenerator = new InitialPromptGenerator({
        processors: [
            new ChatHistoryMessageModifier({ enableChatHistory: true }),   // Previous conversation
            new EnvironmentContextModifier({ enableFullContext: false }), // Environment details
            new DirectoryContextModifier({}),                             // Directory tree
            new AtFileProcessorModifier({}),                              // @file references
            new CoreSystemPromptModifier({
                customSystemPrompt: 'Your system prompt here'             // System prompt (NOTE: no YAML support)
            }),
            new ToolInjectionModifier({                                   // MCP + Agent tools
                toolsLocation: 'Tool',
                giveToolExamples: true
            }),
        ],
        enableLogging: true
    });

    let processedMessage: ProcessedMessage = await promptGenerator.processMessage(userMessage);

    // Step 2: Create AgentStep for LLM inference
    const agentStep = new AgentStep({
        preInferenceProcessors: [
            new ChatCompressionModifier({ enableCompression: true })      // Auto-summarize if long
        ],
        postInferenceProcessors: [],
        llmRole: 'default'
    });

    // Step 3: Create ResponseExecutor for tool execution
    const responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: []
    });

    // Step 4: Main conversation loop
    let completed = false;

    while (!completed) {
        // LLM Inference (replaces llm.inference)
        const stepOutput = await agentStep.executeStep(userMessage, processedMessage);

        // Tool Execution (replaces LLMOutputHandler.runTools + FollowUpQuestionBuilder)
        const responseOutput = await responseExecutor.executeResponse({
            initialUserMessage: userMessage,
            actualMessageSentToLLM: stepOutput.actualMessageSentToLLM,
            rawLLMOutput: stepOutput.rawLLMResponse,
            nextMessage: stepOutput.nextMessage
        });

        // Check completion (replaces llmOutputObject.isCompleted())
        completed = responseOutput.completed;

        // Update for next iteration (replaces addPreviousConversation + addToolResult)
        processedMessage = responseOutput.nextMessage;

        if (completed && responseOutput.finalMessage) {
            console.log("Final response:", responseOutput.finalMessage);
        }
    }

    console.log("Agent workflow completed successfully!");
}
```

### New Unified Library (Simple - Using CodeboltAgent)

If you don't need manual control over each step, use the simpler `CodeboltAgent`:

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

async function runAgentWorkflow(userMessage: FlatUserMessage, codebolt: CodeboltAPI) {
    const agent = new CodeboltAgent({
        instructions: 'Your system prompt here',
        enableLogging: true
    });

    const result = await agent.processMessage({
        userMessage: userMessage.content,
        messageId: userMessage.id,
        threadId: userMessage.threadId
    });

    if (result.success) {
        console.log("Agent workflow completed successfully!");
        return result.result;
    } else {
        console.error("Agent failed:", result.error);
    }
}
```

---

## Key Architectural Differences

| Aspect | Builder Pattern | Unified Library |
|--------|----------------|-----------------|
| **Approach** | Imperative (chain methods) | Declarative (configure processors) |
| **Loop Management** | Manual `while` loop | Automatic in `Agent.execute()` or manual |
| **Tool Results** | Manual via `addToolResult()` | Automatic in `ResponseOutput.nextMessage` |
| **Message Sending** | Manual `sendMessageToUser()` | Automatic in `ResponseExecutor` |
| **Summarization** | Manual `checkAndSummarize...()` | Processor-based `ChatCompressionModifier` |
| **Extensibility** | Subclass or modify builder | Add/remove processors |
| **Error Handling** | Try-catch in user code | Built-in with graceful fallbacks |

---

## Summary

**All core functionality is available** in the unified library for manual orchestration. The only missing pieces are:

1. **YAML loading utilities** for system prompts and task instructions - load YAML yourself and pass the string to `CoreSystemPromptModifier`
2. **`addAgentsToPrompt()`** - converting agent definitions to prompt text (rarely used, create custom modifier if needed)

The unified library provides **more functionality** through its processor system, including loop detection, IDE context, @file processing, and chat recording that weren't in the old builder pattern.
