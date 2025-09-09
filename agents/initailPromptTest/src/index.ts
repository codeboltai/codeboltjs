import codebolt from '@codebolt/codeboltjs';
import {InitialPromptGenerator,} from '@codebolt/agent/unified'
import { FlatUserMessage } from "@codebolt/types/sdk";
import { SimpleMessageModifier,ConversationCompection,CheckForNoToolCall,AddCurrentDirectoryRootFilesModifier } from '@codebolt/agent/processor-pieces';
import { AgentStep } from '@codebolt/agent/unified';
import { ProcessedMessage } from '@codebolt/types/agent';

(async () => {
    const testMessage: FlatUserMessage = {
        userMessage: "Hello, this is a test message",
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
        baseSystemPrompt:'This is system prompt'
    });
    let prompt:ProcessedMessage = await promptGenerator.processMessage(testMessage);
   
    let preLLMProcessors= [new ConversationCompection()]
    let postLLMProcessors= [new CheckForNoToolCall()]


    let agent = new AgentStep({preLLmProcessors:preLLMProcessors,postLLmProcessors:postLLMProcessors})

    let result =  await agent.executeStep(testMessage,prompt); //Primarily for LLM Calling and has 
    
    prompt= result.nextMessage;
    console.log(prompt)
})();