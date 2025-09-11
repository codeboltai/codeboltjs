import codebolt from '@codebolt/codeboltjs';
import {
    InitialPromptGenerator,

    ResponseExecutor
} from '@codebolt/agent/unified'
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    SimpleMessageModifier,
    ConversationCompection,
    CheckForNoToolCall,
    AddCurrentDirectoryRootFilesModifier,
    BaseContextMessageModifier,
    BaseSystemInstructionMessageModifier,
    WorkingDirectoryMessageModifier,
    AddToolsListMessageModifier
} from '@codebolt/agent/processor-pieces';
import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

codebolt.onMessage(async (reqMessage) => {
    try {


        codebolt.chat.sendMessage("starting process", {})
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
            processors: [
            new BaseSystemInstructionMessageModifier(),
            new BaseContextMessageModifier(),
            new WorkingDirectoryMessageModifier(),
            new AddToolsListMessageModifier({
                addToolsLocation:'Tool'
            })
        ],
            baseSystemPrompt: 'Based on User Msessage send reply'
        });
        let prompt: ProcessedMessage = await promptGenerator.processMessage(testMessage);
        let preLLMProcessors = [new ConversationCompection()]
        let postLLMProcessors = [new CheckForNoToolCall()]
      


        let completed = false;
        
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result: AgentStepOutput = await agent.executeStep(testMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;
            console.log(prompt)
            let responseExecutor = new ResponseExecutor({
                preToolCalProcessors: [],
                postToolCallProcessors: []

            })
            // codebolt.chat.sendMessage(result.rawLLMResponse.choices?.[0]?.message?.content ?? "No response generated",{})
            let executionResult = await responseExecutor.executeResponse({
                initailUserMessage: testMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });
            
            completed = executionResult.completed;
            prompt = executionResult.nextMessage;
            
        } while (!completed);

        



    } catch (error) {
        console.log(error)
    }
})