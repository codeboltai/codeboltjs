import { AddTokenResponse, GetTokenResponse } from '@codebolt/types/sdk';
import cbws from '../core/websocket';
import { EventType, TokenizerAction, TokenizerResponseType } from '@codebolt/types';
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
                "type": EventType.TOKENIZER_EVENT,
                "action": TokenizerAction.ADD_TOKEN,
                "message": {
                    item: key
                },
            },
            TokenizerResponseType.ADD_TOKEN_RESPONSE
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
                "type": EventType.TOKENIZER_EVENT,
                "action": TokenizerAction.GET_TOKEN,
                "message": {
                    item: key
                },
            },
            TokenizerResponseType.GET_TOKEN_RESPONSE
        );
    }
}

export default tokenizer