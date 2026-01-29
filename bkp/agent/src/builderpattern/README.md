# Agent Library

This library provides a set of classes for building and managing AI agent workflows with tool execution and conversation management.

## Classes

### PromptBuilder
```
THis is Now Replaced with InitialPromptGenerator in Unified. That has the concept of processors which is more flexible
```

The `PromptBuilder` class helps construct complex prompts with tools, environment details, and system instructions.

```typescript
import { PromptBuilder } from './promptbuilder';

const promptBuilder = new PromptBuilder(userMessage, codebolt);
const prompt = await promptBuilder
    .addMCPTools()
    .addAgentTools()
    .addEnvironmentDetails()
    .addSystemPrompt('agent.yaml', 'test', 'example.md')
    .addTaskInstruction('task.yaml', 'main_task')
    .buildInferenceParams();
```

### LLMOutputHandler

```
THis is Replaced by Execute Response in Unified
```

The `LLMOutputHandler` class processes LLM responses, executes tool calls, and manages completion detection.

```typescript
import { LLMOutputHandler } from './llmoutputhandler';

const llmOutput = llm.inference(prompt);
const outputHandler = new LLMOutputHandler(llmOutput, codebolt);

// Send message to user
await outputHandler.sendMessageToUser();

// Execute tools
const toolResults = await outputHandler.runTools();

// Check if completed
if (outputHandler.isCompleted()) {
    console.log("Task completed!");
}
```

### FollowUpQuestionBuilder

```
THis is replaced by buildFollowUpConversation in unified
```

The `FollowUpQuestionBuilder` class manages conversation continuation and summarization.

```typescript
import { FollowUpQuestionBuilder } from './followupquestionbuilder';

const followUpBuilder = new FollowUpQuestionBuilder(codebolt);
const nextPrompt = await followUpBuilder
    .addPreviousConversation(previousPrompt)
    .addToolResult(toolResults)
    .checkAndSummarizeConversationIfLong()
    .buildInferenceParams();
```

## Complete Workflow Example

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

## Key Features

- **Fluent Interface**: All builders use method chaining for easy configuration
- **Automatic Tool Loading**: Automatically loads MCP tools and agent tools
- **Environment Integration**: Includes file contents and project structure
- **Conversation Management**: Handles conversation history and summarization
- **Tool Execution**: Executes tools and manages results
- **Completion Detection**: Automatically detects when tasks are complete
- **Error Handling**: Robust error handling and recovery mechanisms

## Architecture

The library follows a modular design:

1. **PromptBuilder**: Constructs initial prompts with all necessary context
2. **LLMOutputHandler**: Processes LLM responses and executes tools
3. **FollowUpQuestionBuilder**: Manages conversation continuation and summarization

This separation allows for flexible usage patterns and easy testing of individual components. 