There will be three functions:
1. **Initial Prompt Generator**
	This is the Initial Prompt Generator Function that Converts the input Message by the user into a prompt that can be sent to the user. 

	This uses one type of Processor:
	- **Message Modifiers** This is the modifier that converts the userMessage to the Initial Prompt.

	This has the following input:
	- UserMessage - Initial Message the User has sent
	- Context - This is important for Inter-Processor Communication. In case one Processor wants to communicate with another processor, then it should use this context to pass the variables to the processor.
	- BaseSystemPrompt - This is a base system prompt that is used to create the initial message
	- MessageModifierPrompts - This is the list of Message Modifiers that are to be applied to the InitialMessage
	
	Output:
	- Created Message -  This is the message that is usually sent to the LLM. (There will be additional PreLLMProcessors that the Agent Step may Apply before sending to the LLM)
	- Context - This is a Broader Context Object for Inter Step and Inter Processor Communication
	
2. **AgentStep**
	This is the Agent Step that takes the User Message and then passes it to the LLM and then gives the LLM Output.

	This uses two Processors:
	- **PreInferenceProcessors** - The PreInference Processor is the processor that runs before the Inference is called.
	- **PostInferenceProcessors** - This is the processor that is called after the inference is run. This is primarily used for testing.
	
	This has the following Input:
	- InitialUserMessage - Although this is not used too much, but still it can be passed so that any Processor can use it. 
	- Created Message - This is the output of the Initial Prompt Generator Function, or if this is calling the second time then this is the prompt result of the first step.
	- PreInferenceProcessors - This is the list of PreInferenceProcessors that have to be applied.
	- PostInferenceProcessors - This is the postInferenceProcessors that have to be applied.
	- LLMConfig - This is the LLM Config that can be added like temperature etc.
	
	This has the following output:
	- rawLLMOutput - This is the actual Raw LLM output
	- nextMessage - This is the basic nextMessage. Although this does not has the Tool Call but this gives some basic Data. 
	- context - This is the Context that is passed across


3. ResponseExecutor
	This is the Executor Function that handles the Tool Execution. This executes the tools and then gives the output prompt by combining the tool Call Results and the initial prompt. 
	
	This uses two Processors:
	- **PreToolCallProcessors** - This is the processor that is called before the Tool Call. This is primarily used for checking if the tool call Requirement is proper and correct. 
	- **PostToolCallProcessors** - This is the processor that is called after the tool Call. This is where it will process the output of the Tool Call and update the prompt Message based on that Tool Call Result.
	
	This has the following input:
	- UserMessage
	- RawLLMOutput
	- NextMessage - Here the NextMessage Should ideally contain the message that was sent to the llm. So we need not 
	- PreToolCallProcessors
	- PostToolCallProcessors
	
	This has the following output:
	- NextPrompt - This is the actual next prompt that has to be passed next time to the agent
	- context - the running context
	