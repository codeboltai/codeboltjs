import cbws from '../core/websocket';
import { LLMResponse } from '@codebolt/types/sdk';
import type { MessageObject, ToolCall, Tool, LLMInferenceParams, LLMCompletion, LLMModelConfig } from '@codebolt/types/sdk';
import { EventType, LLMResponseType, StateAction, StateResponseType } from '@codebolt/types/enum';



/**
 * A module for interacting with language learning models (LLMs) via WebSocket.
 */
const cbllm = {
    /**
     * Sends an inference request to the LLM using OpenAI message format with tools support.
     * The model is selected based on the provided `llmrole`. If the specific model
     * for the role is not found, it falls back to the default model for the current agent,
     * and ultimately to the default application-wide LLM if necessary.
     * 
     * @param params - The inference parameters including:
     *   - messages: Array of conversation messages
     *   - tools: Available tools for the model to use
     *   - tool_choice: How the model should use tools
     *   - full: Whether to return full response
     *   - max_tokens: Maximum number of tokens to generate
     *   - temperature: Temperature for response generation
     *   - stream: Whether to stream the response
     * @returns A promise that resolves with the LLM's response
     */
    inference: async (params:LLMInferenceParams): Promise<{ completion: LLMCompletion }> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.LLM_EVENT,
                "message": {
                    prompt: params,
                    llmrole:params.llmrole
                },
            },
            LLMResponseType.LLM_RESPONSE
        );
    },

  

    /**
     * Gets the model configuration for a specific model or the default application model.
     * If modelId is provided, returns configuration for that specific model.
     * If modelId is not provided, returns the default application LLM configuration.
     * 
     * @param modelId - Optional model identifier. If not provided, returns default model config.
     * @returns A promise that resolves with the model configuration including provider and model details.
     */
    getModelConfig: async (modelId?: string): Promise<{ config: LLMModelConfig | null, success: boolean, error?: string }> => {
       
            return await cbws.messageManager.sendAndWaitForResponse(
                {
                    "type": EventType.STATE_EVENT,
                    "message": {
                        action: StateAction.GET_APP_STATE,
                        modelId: modelId // Include modelId if provided for future extensibility
                    },
                },
                StateResponseType.GET_APP_STATE_RESPONSE
            );

       
    }

    /**
     * Legacy method for backward compatibility - converts simple string prompt to message format.
     * @deprecated Use the new inference method with proper message format instead.
     * 
     * @param {string} message - The input message or prompt to be sent to the LLM.
     * @param {string} llmrole - The role of the LLM to determine which model to use.
     * @returns {Promise<LLMResponse>} A promise that resolves with the LLM's response.
     */
    // legacyInference: async (message: string, llmrole: string): Promise<LLMResponse> => {
    //     const messages: Message[] = [
    //         {
    //             role: 'user',
    //             content: message
    //         }
    //     ];
        
    //     return cbllm.inference({
    //         messages,
          
    //     },  llmrole);
    // }
};

export default cbllm;
