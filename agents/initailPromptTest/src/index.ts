import codebolt from '@codebolt/codeboltjs';
import {
    InitialPromptGenerator,

    ResponseExecutor
} from '@codebolt/agent/unified'
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    ChatCompressionModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier

   
} from '@codebolt/agent/processor-pieces';



import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

codebolt.onMessage(async (reqMessage:FlatUserMessage) => {
    try {


        codebolt.chat.sendMessage("starting process", {})
      
        let promptGenerator = new InitialPromptGenerator({
            processors: [
                // 1. Environment Context (date, OS)
                new EnvironmentContextModifier(),
                
                // 2. Directory Context (folder structure)  
                new DirectoryContextModifier(),
                
                // 3. IDE Context (active file, opened files)
                new IdeContextModifier(),
                
                // 4. Core System Prompt (instructions)
                new CoreSystemPromptModifier(),
                
                // 5. Tools (function declarations)
                new ToolInjectionModifier(),
                
                // 6. Chat Compression (history management)
                new ChatCompressionModifier(),
                
                // 7. At-file processing (@file mentions)
                new AtFileProcessorModifier()
        ],
            baseSystemPrompt: 'Based on User Msessage send reply'
        });
        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
        let preLLMProcessors = []
        let postLLMProcessors = []
      


        let completed = false;
        
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;
            console.log(prompt)
            let responseExecutor = new ResponseExecutor({
                preToolCalProcessors: [],
                postToolCallProcessors: []

            })
            // codebolt.chat.sendMessage(result.rawLLMResponse.choices?.[0]?.message?.content ?? "No response generated",{})
            let executionResult = await responseExecutor.executeResponse({
                initailUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });
            
            completed = executionResult.completed;
            prompt = executionResult.nextMessage;
          
            
            if (completed) {
                break;
            }
            
        } while (!completed);

        



    } catch (error) {
        console.log(error)
    }
})