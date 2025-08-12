# Agent Workflow Example - Migration Notice

## Important: Agent Functionality Moved

The agent functionality (Agent, PromptBuilder, LLMOutputHandler, etc.) has been moved to a separate package:

**New Package:** `@codebolt/agent`

## Installation

```bash
npm install @codebolt/agent
```

## Updated Usage

The `agent-workflow-example.ts` file in this directory demonstrates the old usage. To use the new package, update your imports:

### Before (old):
```typescript
import { PromptBuilder, LLMOutputHandler, FollowUpQuestionBuilder } from '../src/agentlib/promptbuilder';
```

### After (new):
```typescript
import { 
  InitialPromptBuilder as PromptBuilder, 
  LLMOutputHandler, 
  FollowUpPromptBuilder as FollowUpQuestionBuilder 
} from '@codebolt/agent';
```

## Example Usage with New Package

```typescript
import { 
  Agent, 
  InitialPromptBuilder, 
  LLMOutputHandler, 
  FollowUpPromptBuilder,
  SystemPrompt,
  TaskInstruction 
} from '@codebolt/agent';
import llm from '@codebolt/codeboltjs';

async function runAgentWorkflow(userMessage: any, codebolt: any) {
  // Build initial prompt
  const promptBuilder = new InitialPromptBuilder(userMessage);
  const userPrompt = await promptBuilder
    .addMCPTools()
    .addAgentTools()
    .addEnvironmentDetails()
    .addSystemPrompt('agent.yaml', 'test', 'example.md')
    .addTaskInstruction('task.yaml', 'main_task')
    .buildInferenceParams();

  // Get LLM response
  let llmOutput = llm.inference(userPrompt);
  let llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);

  // Main conversation loop
  while (!llmOutputObject.isCompleted()) {
    await llmOutputObject.sendMessageToUser();
    const toolCallResult = await llmOutputObject.runTools();
    
    const followUpBuilder = new FollowUpPromptBuilder(codebolt);
    const nextUserPrompt = await followUpBuilder
      .addPreviousConversation(userPrompt)
      .addToolResult(toolCallResult)
      .checkAndSummarizeConversationIfLong()
      .buildInferenceParams();

    llmOutput = llm.inference(nextUserPrompt);
    llmOutputObject = new LLMOutputHandler(llmOutput, codebolt);
    userPrompt.messages = nextUserPrompt.messages;
  }
}
```

## Benefits of the New Package

1. **Focused functionality**: Agent-specific utilities separated from core library
2. **Better dependency management**: Cleaner separation of concerns
3. **Easier maintenance**: Independent versioning and updates
4. **Smaller bundle size**: Only include what you need

## Migration Guide

1. Install the new package: `npm install @codebolt/agent-utils`
2. Update imports to use the new package
3. Update class names if needed (e.g., `PromptBuilder` → `InitialPromptBuilder`)
4. Test your code to ensure everything works correctly

The core functionality remains the same, only the package location has changed.
