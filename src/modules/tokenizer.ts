import cbws from './websocket';

/**
 * Tokenizer module for handling token-related operations.
 */
const tokenizer = {
  
    /**
     * Adds a token asynchronously.
     * @param {string} key - The key of the token to add.
     * @returns {Promise<any>} A promise that resolves with the response.
     */
    addToken: async (key: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"tokenizerEvent",
                "action": "addToken",
                "message": {
                    item: key
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "addTokenResponse") {
                    resolve(response);
                }
            });
        });
    },

    getToken: async (key: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"tokenizerEvent",
                "action": "getToken",
                "message": {
                    item: key
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getTokenResponse") {
                    resolve(response);
                }
            });
        });
    }
}

export default tokenizer