import { AddTokenResponse, GetTokenResponse } from '@codebolt/types';
import cbws from './websocket';
import CbWS from './websocket';
import { EventEmitter } from 'events';
class CustomEventEmitter extends EventEmitter {}
/**
 * Tokenizer module for handling token-related operations.
 */
class CBTokenizer{
    /**
     * Adds a task using a WebSocket message.
     * @param {string} task - The task to be added.
     * @returns {Promise<AddTaskResponse>} A promise that resolves with the response from the add task event.
     */
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
    /**
     * Adds a token to the system via WebSocket.
     * @param {string} key - The key associated with the token to be added.
     * @returns {Promise<AddTokenResponse>} A promise that resolves with the response from the add token event.
     */
    addToken= async (key: string): Promise<AddTokenResponse> => {
        return new Promise((resolve, reject) => {
            this.wsManager.send(JSON.stringify({
                "type":"tokenizerEvent",
                "action": "addToken",
                "message": {
                    item: key
                },
            }));
            this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "addTokenResponse") {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Retrieves a token from the system via WebSocket.
     * @param {string} key - The key associated with the token to be retrieved.
     * @returns {Promise<GetTokenResponse>} A promise that resolves with the response from the get token event.
     */
    getToken= async (key: string): Promise<GetTokenResponse> => {
        return new Promise((resolve, reject) => {
            this.wsManager.send(JSON.stringify({
                "type":"tokenizerEvent",
                "action": "getToken",
                "message": {
                    item: key
                },
            }));
            this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getTokenResponse") {
                    resolve(response);
                }
            });
        });
    }
}

export default CBTokenizer