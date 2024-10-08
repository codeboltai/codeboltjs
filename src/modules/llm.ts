import cbws from './websocket';
import {LLMResponse } from '@codebolt/types';

import CbWS from './websocket';

class CustomEventEmitter extends EventEmitter { }
import { EventEmitter } from 'events';
/**
 * A module for interacting with language learning models (LLMs) via WebSocket.
 */
class CBLLM{
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
    /**
     * Sends an inference request to the LLM and returns the model's response.
     * The model is selected based on the provided `llmrole`. If the specific model
     * for the role is not found, it falls back to the default model for the current agent,
     * and ultimately to the default application-wide LLM if necessary.
     * 
     * @param {string} message - The input message or prompt to be sent to the LLM.
     * @param {string} llmrole - The role of the LLM to determine which model to use.
     * @returns {Promise<LLMResponse>} A promise that resolves with the LLM's response.
     */
    inference= async (message: string, llmrole: string): Promise<LLMResponse> => {
        return new Promise((resolve, reject) => {
            this.wsManager.send(JSON.stringify({
                "type": "inference",
                "message": {
                    prompt: message,
                    llmrole
                },
            }));
            this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "llmResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    }
};

export default CBLLM;