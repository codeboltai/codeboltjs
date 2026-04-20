import { PostInferenceProcessor, PreInferenceProcessor,AgentStepInterface, AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

import codebolt from '@codebolt/codeboltjs';



import { FlatUserMessage, LLMInferenceParams, LLMCompletion } from '@codebolt/types/sdk';
import {
    appendTranscriptMessages,
    buildInferenceParams,
    reconcileRuntimePromptContext,
    syncProcessedMessageWithRuntimeContext,
} from './promptContext';


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
            let preparedMessage = syncProcessedMessageWithRuntimeContext(createdMessage);

            for (const preInferenceProcessor of this.preInferenceProcessors) {
                try {
                    preparedMessage = await preInferenceProcessor.modify(originalRequest, preparedMessage);
                    preparedMessage = reconcileRuntimePromptContext(preparedMessage);
                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                }
            }

            const actualMessageSentToLLM: ProcessedMessage = {
                ...preparedMessage,
                message: buildInferenceParams(preparedMessage),
            };

            const rawLLMResponse:LLMCompletion = await this.generateResponse(actualMessageSentToLLM.message);

            const assistantMessages = (rawLLMResponse.choices ?? []).map((contentBlock) => ({
                ...contentBlock.message,
                role: contentBlock.message.role as 'user' | 'assistant' | 'tool' | 'system'
            }));

            let modifiedMessage = appendTranscriptMessages(preparedMessage, assistantMessages);

            for (const postInferenceProcessor of this.postInferenceProcessors) {
                try {
                    modifiedMessage = await postInferenceProcessor.modify(
                        actualMessageSentToLLM,
                        rawLLMResponse,
                        modifiedMessage,
                    );
                    modifiedMessage = reconcileRuntimePromptContext(modifiedMessage);
                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                }
            }

            const output: AgentStepOutput = {
                rawLLMResponse:rawLLMResponse,
                nextMessage:modifiedMessage,
                actualMessageSentToLLM
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
