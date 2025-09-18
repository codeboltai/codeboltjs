
codebolt.onMessage(message){
  let promptGenerator = new InitialPromptGenerator({
    processors: [

    ],
    baseSystemPrompt: "This is base System Prompt",
    templating: true,
    context: {
      
    }
  });
  let responseExecutor = new ResponseExecutor({
    llmConfig: 
    codebolt: this.codebolt,
    
  })
  let agent = new AgentStep({
    llmConfig: 
    codebolt: this.codebolt,
  })
  let result;

  let prompt = promptGenerator.processMessage(message);
  do {
    result =  await agent.executeStep(prompt); //Primarily for LLM Calling and has 
    let {prompt,continue} = responseExecutor.executeResponse(result);  // Primarily for Tool Calling and then getting the result and adding it to the prompt for the next step.
  } while(continue)  
}


/*
 Processors:
  - Prompt Generator
    - Message Modifier Processors  (for getting images updated, Tool Adding, etc prompt handling) 
  - AgentStep
    - Pre-Inference Processors     (For the checking of loops, compacting conversations etc.)
    // - Post-Inference Processors     (For checking that the output is valid)
  // - Response Executor
    - PreToolCallProcessors         (for checking if the tool call parameters are valid,  Intercepting Local Tool Calls, etc.)
    - PostToolCallProcessors        (For Converting the Tool Response to proper Prompt)