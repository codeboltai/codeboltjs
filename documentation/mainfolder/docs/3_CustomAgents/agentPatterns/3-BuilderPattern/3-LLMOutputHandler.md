# LLM Output Handler

The `LLMOutputHandler` class processes LLM responses, executes tool calls, and manages completion detection.

  

```ts
import { LLMOutputHandler } from './llmoutputhandler';
const llmOutput = llm.inference(prompt);
const outputHandler = new LLMOutputHandler(llmOutput, codebolt);
await outputHandler.sendMessageToUser();
const toolResults = await outputHandler.runTools();
if (outputHandler.isCompleted()) {
	console.log("Task completed!");
}
```

The LLMOutputHandler is the main Class that takes the output of the inference and then handles the things like Tool Calling, End of AgentCall, and sending to User. 


It uses simple llm.inference to call using the prompt and then passes the result to the LLMOutputHandler.