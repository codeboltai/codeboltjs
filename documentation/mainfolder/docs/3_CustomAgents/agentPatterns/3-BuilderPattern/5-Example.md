
### PromptBuilder

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

The `LLMOutputHandler` class processes LLM responses, executes tool calls, and manages completion detection.

```typescript
import { LLMOutputHandler } from './llmoutputhandler';
const llmOutput = llm.inference(prompt);
const outputHandler = new LLMOutputHandler(llmOutput, codebolt);
await outputHandler.sendMessageToUser();
const toolResults = await outputHandler.runTools();
if (outputHandler.isCompleted()) {
	console.log("Task completed!");
}
```

### FollowUpQuestionBuilder

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
import { PromptBuilder, LLMOutputHandler, FollowUpPromptBuilder } from './promptbuilder';
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
	const followUpBuilder = new FollowUpPromptBuilder(codebolt);
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
```