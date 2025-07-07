import { AddTokenResponse, GetTokenResponse } from '../types/cliWebSocketInterfaces';
import cbws from '../core/websocket';

/**
 * Tokenizer module for handling token-related operations.
 */
const tokenizer = {
  
    /**
     * Adds a token to the system via WebSocket.
     * @param {string} key - The key associated with the token to be added.
     * @returns {Promise<AddTokenResponse>} A promise that resolves with the response from the add token event.
     */
    addToken: async (key: string): Promise<AddTokenResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type":"tokenizerEvent",
                "action": "addToken",
                "message": {
                    item: key
                },
            },
            "addTokenResponse"
        );
    },

    /**
     * Retrieves a token from the system via WebSocket.
     * @param {string} key - The key associated with the token to be retrieved.
     * @returns {Promise<GetTokenResponse>} A promise that resolves with the response from the get token event.
     */
    getToken: async (key: string): Promise<GetTokenResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type":"tokenizerEvent",
                "action": "getToken",
                "message": {
                    item: key
                },
            },
            "getTokenResponse"
        );
    }
}

export default tokenizer