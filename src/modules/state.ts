import cbws from './websocket';

/**
 * Retrieves the application state asynchronously.
 * @returns {Promise<any>} A promise that resolves with the application state.
 */
const cbstate = {
    getApplicationState: async (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "getAppState",
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getAppStateResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    },
    addToAgentState: async (key: string, value: string): Promise<void> => {
      return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "agentStateEvent",
                "action":"addToAgentState",
                payload:{
                    key,
                    value
                }
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "addToAgentStateResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });  
    },
    getAgentState: async (): Promise<any> => {
       return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "agentStateEvent",
                "action":"getAgentState",
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getAgentStateResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });  
    }
};

export default cbstate;
