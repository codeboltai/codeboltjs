import { PostInferenceProcessor, PreInferenceProcessor,AgentStepInterface, AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

import codebolt from '@codebolt/codeboltjs';



import { FlatUserMessage, LLMInferenceParams, LLMCompletion } from '@codebolt/types/sdk';


/**
 * Unified agent step that handles LLM interaction and tool call analysis
 */
export class AgentStep implements AgentStepInterface {
    private preInferenceProcessors: PreInferenceProcessor[];
    private postInferenceProcessors: PostInferenceProcessor[];
    private llmRole: string;
    
 

    constructor(options: {
        preInferenceProcessors?: PreInferenceProcessor[];
        postInferenceProcessors?: PostInferenceProcessor[];
        llmRole?: string
    } = {}) {
      
        this.preInferenceProcessors = options.preInferenceProcessors || [];
        this.postInferenceProcessors = options.postInferenceProcessors || [];
        this.llmRole = options.llmRole || 'default'
    }

    /**
     * Execute a single agent step
     */
    async executeStep(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<AgentStepOutput> {
        try {
          
            for (const preInferenceProcessor of this.preInferenceProcessors) {
                try {
                    // Each modifier returns a new ProcessedMessage
                    createdMessage= await preInferenceProcessor.modify(originalRequest,createdMessage);

                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                    // Continue with other modifiers
                }
            }

            // Generate LLM response
            const rawLLMResponse:LLMCompletion = await this.generateResponse(createdMessage.message);
            
            // add llm reslponse to created message
            
            let modifiedMessage:ProcessedMessage= createdMessage;
            rawLLMResponse.choices?.forEach(contentBlock=>{
                modifiedMessage.message.messages.push({
                    ...contentBlock.message,
                    role: contentBlock.message.role as 'user' | 'assistant' | 'tool' | 'system'
                })

            })

            for (const postInferenceProcessor of this.postInferenceProcessors) {
                try {
                    // Each modifier returns a new ProcessedMessage
                    modifiedMessage= await postInferenceProcessor.modify(createdMessage,rawLLMResponse,modifiedMessage);

                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                    // Continue with other modifiers
                }
            }
            const output: AgentStepOutput = {
                rawLLMResponse:rawLLMResponse,
                nextMessage:modifiedMessage,
                actualMessageSentToLLM:createdMessage
            };

            return output;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to execute agent step: ${errorMessage}`);
        }
    }

   
   private  async generateResponse(messageForLLM:LLMInferenceParams): Promise<LLMCompletion> {
      const response = await codebolt.llm.inference(messageForLLM)

      const completion = response.completion;

      // Add tokenLimit and maxOutputTokens to completion object if available in response
      if (completion) {
        // Check if tokenLimit exists at response level or in completion
        if ((response as any).tokenLimit !== undefined) {
          completion.tokenLimit = (response as any).tokenLimit;
        }
        if ((response as any).maxOutputTokens !== undefined) {
          completion.maxOutputTokens = (response as any).maxOutputTokens;
        }
        // Also check inside completion object itself (from LLM provider response)
        if ((completion as any).completion?.tokenLimit !== undefined) {
          completion.tokenLimit = (completion as any).completion.tokenLimit;
        }
        if ((completion as any).completion?.maxOutputTokens !== undefined) {
          completion.maxOutputTokens = (completion as any).completion.maxOutputTokens;
        }
      }

      return completion;
    }


    /**
     * Update LLM configuration
     */
    setLLMConfig(config: string): void {
        this.llmRole =config
    }

    /**
     * Get current LLM configuration
     */
    getLLMConfig(): string {
        return  this.llmRole ;
    }

    updatePreInferenceProcessors(processors: PreInferenceProcessor[]){
        this.preInferenceProcessors=processors;
    };

    getPreInferenceProcessors(){
        return this.preInferenceProcessors
    }


    updatePostInferenceProcessors(processors: PostInferenceProcessor[]){
        this.postInferenceProcessors=processors;
    };

    getPostInferenceProcessors(){
        return this.postInferenceProcessors
    }

   
}

