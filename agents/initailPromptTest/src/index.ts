import codebolt from '@codebolt/codeboltjs';
import {InitialPromptGenerator,} from '@codebolt/agent/unified'
import { FlatUserMessage } from "@codebolt/types/sdk";
import { SimpleMessageModifier,ConversationCompection,CheckForNoToolCall,AddCurrentDirectoryRootFilesModifier } from '@codebolt/agent/processor-pieces';
import { AgentStep } from '@codebolt/agent/unified';
import { ProcessedMessage } from '@codebolt/types/agent';

codebolt.onMessage(async (reqMessage) => {
    try {


        codebolt.chat.sendMessage("starting process",{})
        const testMessage: FlatUserMessage = {
            userMessage: "hi",
            currentFile: "",
            selectedAgent: {
                id: "test-agent",
                name: "Test Agent"
            },
            mentionedFiles: [],
            mentionedFullPaths: [],
            mentionedFolders: [],
            mentionedMultiFile: [],
            mentionedMCPs: [],
            uploadedImages: [],
            actions: [],
            mentionedAgents: [],
            mentionedDocs: [],
            links: [],
            universalAgentLastMessage: "",
            selection: null,
            controlFiles: [],
            feedbackMessage: "",
            terminalMessage: "",
            messageId: "test-message-id",
            threadId: "test-thread-id",
            templateType: ""
        };
        let promptGenerator = new InitialPromptGenerator({
            processors: [new SimpleMessageModifier(),
            new AddCurrentDirectoryRootFilesModifier()],
            baseSystemPrompt:'Based on User Msessage send reply'
        });
        let prompt:ProcessedMessage = await promptGenerator.processMessage(testMessage);
       
        let preLLMProcessors= [new ConversationCompection()]
        let postLLMProcessors= [new CheckForNoToolCall()]
    
    
        let agent = new AgentStep({preInferenceProcessors:preLLMProcessors,postInferenceProcessors:postLLMProcessors})
    
        let result =  await agent.executeStep(testMessage,prompt); //Primarily for LLM Calling and has 
        
        prompt= result.nextMessage;
        console.log(prompt)
        codebolt.chat.sendMessage("process finished",{})



    } catch (error) {
        console.log(error)
    }
})