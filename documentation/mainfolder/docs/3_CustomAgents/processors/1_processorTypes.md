# Processor Types

There are multiple types of processors:
1. **Message Modifiers**: These are the ones that modify the message from the user Message to the prompt. 
	- This is a single Type as it is simple Prompt type.
	- This has the format of calling ***modify*** function and passing 
		```
		{originalRequest, createdMessage, and some Context
		```
		This returns:
		```
		createdMessage
		```
	- This is called by the InitialPromptGenerator 
	
2. **PreInferenceProcessors**: This is called before the Agent calls the LLM. 
	- This is Called by AgentStep
	- Called before the LLM Calling Step
	- The ***Modify*** function is called which gets:
		```
		IntialUserMessage, currentMessage, exitEvent
		```
		This returns:
		```
		currentMessage
		```
		
3. **PostInferenceProcessors**: This is called by Agent after the LLM is called and we have gotten the response. This is before the actual Tool Call is done. 
	- This is Called after Inference Processor. 
	- This is Mostly used for things like Response Validation 
	- The Modify function is called which gets:
		```
		llmmessagesent, llmresponsemessage, nextprompt, context
		```
	- This will give output:
		```
		nextprompt, context
		```
	
		The lllminferencetriggerEvent is an event that triggers the recalling of the LLM Inference. This is usually for cases where lets say the llm has not given a proper response.  We need to send the updated message along with the llminferenceTriggerEvent.
		
		The Exit Event is an event that exists the system and sends an error. This is in case lets say the inference is in loop, or other things. In that Case the next Step is not able to proceed.
		
1. **PreToolCallProcessors**:  This is the processor called before the Tool Call. This is used to check if the Tool Call is proper. This is also used to handle the Local Tool Interceptor or any other custom exotic tool Processor. 
	- This will get the inputs:
		```
		llmMessagesent, llmresponsemessage, nextprompt context
		```
	- This will give the result as 
		```
		nextpromt, context, shouldexit
		```
2. **PostToolCallProcessors**: This is the Processor called after the Tool Call. This can help in checking the tool Calls Result and also adding it to the llmMessage. This LLM Message will be used as prompt for the next time. 
	- This will ge the inputs:
		```
		userMessage, llmmessageSent, llmresponsemessage,nextprompt, context
		```
	- This will give result
	```
	nextprompt, context
	```