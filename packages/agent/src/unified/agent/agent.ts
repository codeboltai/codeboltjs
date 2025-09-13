import { AgentConfig, AgentInterface, AgentStepOutput, MessageModifier, PostInferenceProcessor, PostToolCallProcessor, PreInferenceProcessor, PreToolCallProcessor, ProcessedMessage } from "@codebolt/types/agent";
import { InitialPromptGenerator } from "../base";
import { FlatUserMessage } from "@codebolt/types/sdk";

import { ResponseExecutor } from "../base/responseExecutor";
import { AgentStep } from "../base/agentStep";





export class Agent implements AgentInterface {

    private config: AgentConfig
    private messageModifiers: MessageModifier[];
    private preInfrenceProcessors: PreInferenceProcessor[];
    private postInfrenceProcessors: PostInferenceProcessor[];
    private preToolCallProcessors: PreToolCallProcessor[];
    private postToolCallProcessor: PostToolCallProcessor[];

    constructor(config: AgentConfig) {
        this.config = config
        this.messageModifiers = config.processors?.messageModifiers || [];
        this.preInfrenceProcessors = config.processors?.preInferenceProcessors || [];
        this.postInfrenceProcessors = config.processors?.postInferenceProcessors || [];
        this.preToolCallProcessors = config.processors?.preToolCallProcessors || [];
        this.postToolCallProcessor = config.processors?.postToolCallProcessors || [];

    }

   async execute(reqMessage:FlatUserMessage): Promise<{ success: boolean; result: any; error?: string; }> {

        let promptGenerator = new InitialPromptGenerator({
            processors: this.messageModifiers,
            baseSystemPrompt: this.config.instructions || 'Based on User Msessage send reply'
        });
        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
        let completed = false;
        
        do {
            let agent = new AgentStep({ preInferenceProcessors:this.preInfrenceProcessors, postInferenceProcessors: this.postInfrenceProcessors })
            let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;
            console.log(prompt)
            let responseExecutor = new ResponseExecutor({
                preToolCalProcessors: this.preToolCallProcessors,
                postToolCallProcessors: this.postToolCallProcessor

            })
            let executionResult = await responseExecutor.executeResponse({
                initailUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage
            });
            
            completed = executionResult.completed;
            prompt = executionResult.nextMessage;
            if (completed) {
                break;
            }
            
        } while (!completed);

        return {
            success: true,
            result: prompt,
            error: undefined
        };
    }

}