import cbws from '../core/websocket';
import {LLMResponse } from '@codebolt/types';

/**
 * Represents a message in the conversation with roles and content.
 */
export interface Message {
    /** The role of the message sender: user, assistant, tool, or system */
    role: 'user' | 'assistant' | 'tool' | 'system';
    /** The content of the message, can be an array of content blocks or a string */
    content: any[] | string;
    /** Optional ID for tool calls */
    tool_call_id?: string;
    /** Optional tool calls for assistant messages */
    tool_calls?: ToolCall[];
    /** Additional properties that might be present */
    [key: string]: any;
}

/**
 * Represents a tool call in OpenAI format
 */
export interface ToolCall {
    /** Unique identifier for this tool call */
    id: string;
    /** The type of tool call */
    type: 'function';
    /** Function call details */
    function: {
        /** Name of the function to call */
        name: string;
        /** Arguments for the function call as JSON string */
        arguments: string;
    };
}

/**
 * Represents a tool definition in OpenAI format
 */
export interface Tool {
    /** The type of tool */
    type: 'function';
    /** Function definition */
    function: {
        /** Name of the function */
        name: string;
        /** Description of what the function does */
        description?: string;
        /** JSON schema for the function parameters */
        parameters?: any;
    };
}

/**
 * LLM inference request parameters
 */
export interface LLMInferenceParams {
    /** Array of messages in the conversation */
    messages: Message[];
    /** Available tools for the model to use */
    tools?: Tool[];
    /** How the model should use tools */
    tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
    /** The LLM role to determine which model to use */
    llmrole: string;
    /** Maximum number of tokens to generate */
    max_tokens?: number;
    /** Temperature for response generation */
    temperature?: number;
    /** Whether to stream the response */
    stream?: boolean;
}

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
     * @param {LLMInferenceParams} message - The inference parameters including messages, tools, and options.
     * @returns {Promise<LLMResponse>} A promise that resolves with the LLM's response.
     */
    inference: async (message: LLMInferenceParams): Promise<LLMResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "inference",
                "message": {
                    messages: message.messages,
                    tools: message.tools,
                    tool_choice: message.tool_choice,
                    llmrole: message.llmrole
                },
            },
            "llmResponse"
        );
    },

    /**
     * Legacy method for backward compatibility - converts simple string prompt to message format.
     * @deprecated Use the new inference method with proper message format instead.
     * 
     * @param {string} message - The input message or prompt to be sent to the LLM.
     * @param {string} llmrole - The role of the LLM to determine which model to use.
     * @returns {Promise<LLMResponse>} A promise that resolves with the LLM's response.
     */
    legacyInference: async (message: string, llmrole: string): Promise<LLMResponse> => {
        const messages: Message[] = [
            {
                role: 'user',
                content: message
            }
        ];
        
        return cbllm.inference({
            messages,
            llmrole
        });
    }
};

export default cbllm;
