import { AgentConfig, AgentInterface, AgentStepOutput, MessageModifier, PostInferenceProcessor, PostToolCallProcessor, PreInferenceProcessor, PreToolCallProcessor, ProcessedMessage } from "@codebolt/types/agent";
import { InitialPromptGenerator } from "../base";
import { FlatUserMessage } from "@codebolt/types/sdk";
import { ResponseExecutor } from "../base/responseExecutor";
import { AgentStep } from "../base/agentStep";



export class Agent implements AgentInterface {
    private readonly config: AgentConfig;
    private readonly messageModifiers: MessageModifier[];
    private readonly preInferenceProcessors: PreInferenceProcessor[];
    private readonly postInferenceProcessors: PostInferenceProcessor[];
    private readonly preToolCallProcessors: PreToolCallProcessor[];
    private readonly postToolCallProcessors: PostToolCallProcessor[];
    private readonly enableLogging: boolean;

    constructor(config: AgentConfig) {  
        this.config = { ...config };
        this.messageModifiers = config.processors?.messageModifiers || [];
        this.preInferenceProcessors = config.processors?.preInferenceProcessors || [];
        this.postInferenceProcessors = config.processors?.postInferenceProcessors || [];
        this.preToolCallProcessors = config.processors?.preToolCallProcessors || [];
        this.postToolCallProcessors = config.processors?.postToolCallProcessors || [];
        this.enableLogging = config.enableLogging !== false;
    }

    async execute(reqMessage: FlatUserMessage): Promise<{ success: boolean; result: any; error?: string; }> {
        if (!reqMessage) {
            return {
                success: false,
                result: null,
                error: 'Request message is required'
            };
        }

        try {
            const promptGenerator = new InitialPromptGenerator({
                processors: this.messageModifiers,
                baseSystemPrompt: this.config.instructions || 'Based on User Message send reply',
                enableLogging: this.enableLogging
            });
            
            let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
            let completed = false;
            
            while (!completed) {
                
                const agentStep = new AgentStep({ 
                    preInferenceProcessors: this.preInferenceProcessors, 
                    postInferenceProcessors: this.postInferenceProcessors 
                });
                
                const stepResult: AgentStepOutput = await agentStep.executeStep(reqMessage, prompt);
                prompt = stepResult.nextMessage;
                
                if (this.enableLogging) {
                    console.log('[Agent] Step completed, processing response');
                }
                
                const responseExecutor = new ResponseExecutor({
                    preToolCalProcessors: this.preToolCallProcessors,
                    postToolCallProcessors: this.postToolCallProcessors
                });
                
                const executionResult = await responseExecutor.executeResponse({
                    initailUserMessage: reqMessage,
                    actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
                    rawLLMOutput: stepResult.rawLLMResponse,
                    nextMessage: stepResult.nextMessage
                });
                
                completed = executionResult.completed;
                prompt = executionResult.nextMessage;
            }
            
            if (this.enableLogging) {
                console.log('[Agent] Execution completed successfully');
            }
            
            return {
                success: true,
                result: prompt,
                error: undefined
            };
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            
            if (this.enableLogging) {
                console.error('[Agent] Execution failed:', error);
            }
            
            return {
                success: false,
                result: null,
                error: errorMessage
            };
        }
    }

}