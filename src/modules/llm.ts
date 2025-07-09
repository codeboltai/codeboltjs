import cbws from '../core/websocket';
import { LLMResponse } from '../types/cliWebSocketInterfaces';
import type { Message, ToolCall, Tool, LLMInferenceParams } from '../index';

// Re-export types for backward compatibility
export type { Message, ToolCall, Tool, LLMInferenceParams };

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
     * @param message - The inference parameters including:
     *   - messages: Array of conversation messages
     *   - tools: Available tools for the model to use
     *   - tool_choice: How the model should use tools
     *   - llmrole: The LLM role to determine which model to use
     *   - max_tokens: Maximum number of tokens to generate
     *   - temperature: Temperature for response generation
     *   - stream: Whether to stream the response
     * @returns A promise that resolves with the LLM's response
     */
    inference: async (message: string, llmrole: string): Promise<LLMResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "inference",
                "message": {
                    prompt: message,
                    llmrole
                },
            },
            "llmResponse"
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
