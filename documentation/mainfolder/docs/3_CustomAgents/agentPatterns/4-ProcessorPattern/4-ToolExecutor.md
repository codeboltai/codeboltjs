# Tool Executor

This is the Tool Executor that executes the tools. This executes the tools and Gets the Response and then creates a new prompt. 

This is probably similar to [[3-LLMOutputHandler]] where it takes the output of the llm inference and then Executes the Tools. Here we are doing manual Prompt Builder for followup prompts, but in Builder we were using [[4-FollowupPromptBuilder]] 

Example: 

```ts
// Process one step
const agentStepMessageResponse = await agentStep.step(currentMessage);

// Check if we need tool execution
const lastMessage = agentStepMessageResponse.messages[agentStepMessageResponse.messages.length - 1];

if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
	console.log(`[GeminiAgent] Tool calls detected: ${lastMessage.tool_calls.length}`);
	// Execute tools
	const toolExecution = new ToolExecutor(toolList, {
		maxRetries: 2,
		enableLogging: true
	});
	const toolCalls = lastMessage.tool_calls.map(tc => ({
		tool: tc.function.name,
		parameters: typeof tc.function.arguments === 'string'
		? JSON.parse(tc.function.arguments)
		: tc.function.arguments
	}));
	const updatedMessage = await toolExecution.executeTools({
		toolCalls,
		tools: toolList,
		context: { iteration, promptId: `prompt-${Date.now()}` }
	});
	
	// Add tool results to the message for next iteration
	currentMessage = {
		messages: [
			...agentStepMessageResponse.messages,
			{
				role: 'system',
				content: `Tool execution results: ${JSON.stringify(updatedMessage.results)}`,
				name: 'tool-executor'
			}
		]
	};
}
```

Here This is calling the Tool Call and it is manually creating the followup prompt from the result of the LLM. Here it can use something like [[4-FollowupPromptBuilder]]
